// SpeakEasy Kids - Daily Learning Reminder
// Vercel Cron: 16:00 UTC (18:00 Israel time)
// Sends push notifications to parents and children who haven't logged in today

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

module.exports = async function handler(req, res) {
    try {
        const firestore = getFirestoreAdmin();
        const today = new Date().toISOString().split('T')[0];

        // Configure web push
        webpush.setVapidDetails(
            'mailto:listnest@listnest.co.il',
            process.env.VAPID_PUBLIC_KEY || '',
            process.env.VAPID_PRIVATE_KEY || ''
        );

        // Get all families with child accounts
        const familiesSnap = await firestore.collection('families').get();
        let sent = 0;

        for (const familyDoc of familiesSnap.docs) {
            const family = familyDoc.data();
            if (!family.childAccounts || family.childAccounts.length === 0) continue;

            for (const child of family.childAccounts) {
                // Check if child logged in today
                try {
                    const sessionDoc = await firestore
                        .doc(`users/${familyDoc.id}/children/${child.childId}/sessions/${today}`)
                        .get();

                    if (sessionDoc.exists && sessionDoc.data().minutes > 0) continue;
                } catch (e) { /* no session = hasn't logged in */ }

                // Send push to parent
                const parentSubs = await firestore.collection('push-subscriptions')
                    .where('userId', '==', family.adminId)
                    .get();

                for (const subDoc of parentSubs.docs) {
                    try {
                        await webpush.sendNotification(
                            subDoc.data().subscription,
                            JSON.stringify({
                                title: 'SpeakEasy Kids',
                                body: `${child.displayName} עדיין לא נכנס/ה היום ללמוד אנגלית`,
                                lang: 'he',
                                tag: `kids-reminder-${child.childId}`
                            })
                        );
                        sent++;
                    } catch (e) {
                        if (e.statusCode === 410 || e.statusCode === 404) {
                            await subDoc.ref.delete();
                        }
                    }
                }

                // Send push to child's device (if subscribed)
                const childSubs = await firestore.collection('push-subscriptions')
                    .where('childId', '==', child.childId)
                    .get();

                for (const subDoc of childSubs.docs) {
                    try {
                        await webpush.sendNotification(
                            subDoc.data().subscription,
                            JSON.stringify({
                                title: 'SpeakEasy Kids 🦉',
                                body: `היי ${child.displayName}! בוא/י נלמד אנגלית!`,
                                lang: 'he',
                                tag: `kids-reminder-child-${child.childId}`
                            })
                        );
                        sent++;
                    } catch (e) {
                        if (e.statusCode === 410 || e.statusCode === 404) {
                            await subDoc.ref.delete();
                        }
                    }
                }
            }
        }

        res.status(200).json({ ok: true, sent, date: today });
    } catch (error) {
        console.error('Daily reminder error:', error);
        res.status(500).json({ error: error.message });
    }
};
