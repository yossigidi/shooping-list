// ListNest Scheduled Reminders API
// Vercel Serverless Function - Cron Job
// Runs every 15 minutes to check and send scheduled reminders

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
function getFirestoreAdmin() {
    if (getApps().length === 0) {
        // Parse the service account from environment variable
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');

        initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID
        });
    }
    return getFirestore();
}

// Check if current time matches a scheduled reminder
function isReminderDue(reminder, now) {
    if (!reminder.enabled) return false;

    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check if today is one of the scheduled days
    if (!reminder.days.includes(currentDay)) return false;

    // Parse reminder time (format: "HH:MM")
    const [reminderHour, reminderMinute] = reminder.time.split(':').map(Number);

    // Check if current time is within 15 minutes of the scheduled time
    // This accounts for the cron running every 15 minutes
    const reminderMinutesSinceMidnight = reminderHour * 60 + reminderMinute;
    const currentMinutesSinceMidnight = currentHour * 60 + currentMinute;

    const timeDiff = currentMinutesSinceMidnight - reminderMinutesSinceMidnight;

    // Reminder is due if we're within 0-14 minutes after the scheduled time
    if (timeDiff < 0 || timeDiff >= 15) return false;

    // Check if reminder was already sent today (within last 12 hours to be safe)
    if (reminder.lastSent) {
        const lastSentDate = reminder.lastSent.toDate ? reminder.lastSent.toDate() : new Date(reminder.lastSent);
        const hoursSinceLastSent = (now - lastSentDate) / (1000 * 60 * 60);
        if (hoursSinceLastSent < 12) return false;
    }

    return true;
}

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Verify this is a cron request (Vercel adds this header)
    const authHeader = req.headers['authorization'];
    const cronSecret = process.env.CRON_SECRET;

    // In production, verify the cron secret
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        // Allow GET requests for testing without auth
        if (req.method !== 'GET' || !req.query.test) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    try {
        const db = getFirestoreAdmin();
        const now = new Date();
        const results = {
            checked: 0,
            sent: 0,
            families: [],
            errors: []
        };

        // Query all families that have scheduled reminders
        const familiesSnapshot = await db.collection('families').get();

        for (const familyDoc of familiesSnapshot.docs) {
            const familyData = familyDoc.data();
            const familyId = familyDoc.id;
            const scheduledReminders = familyData.reminderSettings?.scheduledReminders || [];

            if (scheduledReminders.length === 0) continue;

            results.checked++;

            for (const reminder of scheduledReminders) {
                if (!isReminderDue(reminder, now)) continue;

                try {
                    // Create a reminder message in family-chat
                    const chatMessage = {
                        text: reminder.message || 'Don\'t forget to add items to the list!',
                        type: 'reminder',
                        senderName: reminder.createdByName || 'System',
                        senderUid: 'system',
                        isScheduled: true,
                        familyId: familyId,
                        createdAt: FieldValue.serverTimestamp()
                    };

                    await db.collection('family-chat').add(chatMessage);

                    // Update lastSent timestamp
                    const updatedReminders = scheduledReminders.map(r =>
                        r.id === reminder.id ? { ...r, lastSent: now } : r
                    );

                    await db.collection('families').doc(familyId).update({
                        'reminderSettings.scheduledReminders': updatedReminders
                    });

                    // Log to reminder-history
                    await db.collection('reminder-history').add({
                        familyId: familyId,
                        type: 'scheduled',
                        reminderId: reminder.id,
                        sentBy: reminder.createdBy,
                        sentByName: reminder.createdByName,
                        message: reminder.message,
                        sentAt: FieldValue.serverTimestamp()
                    });

                    results.sent++;
                    results.families.push({
                        familyId,
                        familyName: familyData.name,
                        reminderTime: reminder.time
                    });

                    console.log(`Sent scheduled reminder for family ${familyId} at ${reminder.time}`);
                } catch (reminderError) {
                    console.error(`Error sending reminder for family ${familyId}:`, reminderError);
                    results.errors.push({
                        familyId,
                        error: reminderError.message
                    });
                }
            }
        }

        return res.status(200).json({
            success: true,
            timestamp: now.toISOString(),
            ...results
        });
    } catch (error) {
        console.error('Reminders cron error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}
