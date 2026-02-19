// ListNest Shopping Day Push Notification API
// Vercel Serverless Function - Cron Job
// Runs daily at 6:00 UTC (8:00 AM Israel time) to send shopping day reminders

const admin = require('firebase-admin');
const webpush = require('web-push');

let db = null;

function getFirestoreAdmin() {
    if (db) return db;

    if (admin.apps.length === 0) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID
            });
        } catch (error) {
            console.error('Firebase init error:', error);
            throw error;
        }
    }
    db = admin.firestore();
    return db;
}

// Shopping day reminder messages per language
const REMINDER_MESSAGES = {
    he: {
        title: 'ListNest - יום קניות! 🛒',
        body: 'היום יום קניות! 🛒 אל תשכחו לבדוק את הרשימה'
    },
    en: {
        title: 'ListNest - Shopping Day! 🛒',
        body: "It's shopping day! 🛒 Don't forget to check the list"
    },
    ru: {
        title: 'ListNest - День покупок! 🛒',
        body: 'Сегодня день покупок! 🛒 Не забудьте проверить список'
    },
    ar: {
        title: 'ListNest - يوم التسوق! 🛒',
        body: 'اليوم يوم التسوق! 🛒 لا تنسَ مراجعة القائمة'
    }
};

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Verify cron secret (allow GET with ?test=1 for testing)
    const authHeader = req.headers['authorization'];
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        if (req.method !== 'GET' || !req.query.test) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    try {
        const db = getFirestoreAdmin();

        // Get current day of week (Israel time = UTC+2/+3)
        const now = new Date();
        const israelTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
        const todayDayOfWeek = israelTime.getDay(); // 0=Sunday, 6=Saturday

        const results = {
            today: todayDayOfWeek,
            familiesChecked: 0,
            familiesMatched: 0,
            pushesSent: 0,
            pushesFailed: 0,
            staleRemoved: 0,
            errors: []
        };

        // Query families where shoppingDay matches today
        const familiesSnapshot = await db.collection('families')
            .where('shoppingDay', '==', todayDayOfWeek)
            .get();

        results.familiesMatched = familiesSnapshot.size;

        // Only configure web-push if there are families to notify
        let vapidConfigured = false;

        for (const familyDoc of familiesSnapshot.docs) {
            const familyId = familyDoc.id;

            try {
                // Get push subscriptions for this family
                const subsSnapshot = await db.collection('push-subscriptions')
                    .where('familyId', '==', familyId)
                    .get();

                if (subsSnapshot.empty) continue;

                // Lazy-init VAPID on first subscription found
                if (!vapidConfigured) {
                    webpush.setVapidDetails(
                        (process.env.VAPID_SUBJECT || 'mailto:support@listnest.co.il').trim(),
                        (process.env.VAPID_PUBLIC_KEY || '').trim(),
                        (process.env.VAPID_PRIVATE_KEY || '').trim()
                    );
                    vapidConfigured = true;
                }

                for (const subDoc of subsSnapshot.docs) {
                    const subData = subDoc.data();
                    const lang = subData.language || 'he';
                    const message = REMINDER_MESSAGES[lang] || REMINDER_MESSAGES.he;

                    const pushPayload = JSON.stringify({
                        title: message.title,
                        body: message.body,
                        lang: lang,
                        tag: 'shopping-day-reminder'
                    });

                    const pushSubscription = {
                        endpoint: subData.endpoint,
                        keys: {
                            p256dh: subData.keys.p256dh,
                            auth: subData.keys.auth
                        }
                    };

                    try {
                        await webpush.sendNotification(pushSubscription, pushPayload);
                        results.pushesSent++;
                    } catch (pushError) {
                        // Remove stale subscriptions (gone or not found)
                        if (pushError.statusCode === 410 || pushError.statusCode === 404) {
                            await subDoc.ref.delete();
                            results.staleRemoved++;
                        } else {
                            results.pushesFailed++;
                            results.errors.push({
                                familyId,
                                subId: subDoc.id,
                                error: pushError.message,
                                statusCode: pushError.statusCode
                            });
                        }
                    }
                }
            } catch (familyError) {
                results.errors.push({
                    familyId,
                    error: familyError.message
                });
            }
        }

        return res.status(200).json({
            success: true,
            timestamp: now.toISOString(),
            ...results
        });
    } catch (error) {
        console.error('Shopping day push cron error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
