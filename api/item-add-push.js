// ListNest Item Add Push Notification API
// Sends push notifications to family members when items are added to the list

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

const titles = {
    he: (name) => `${name} הוסיף/ה לרשימה`,
    en: (name) => `${name} added to the list`,
    ru: (name) => `${name} добавил(а) в список`,
    ar: (name) => `${name} أضاف إلى القائمة`
};

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { familyId, senderUid, senderName, itemNames } = req.body || {};

    if (!familyId || !senderUid || !senderName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const db = getFirestoreAdmin();

        // Get push subscriptions for this family
        const subsSnapshot = await db.collection('push-subscriptions')
            .where('familyId', '==', familyId)
            .get();

        if (subsSnapshot.empty) {
            return res.status(200).json({ success: true, pushesSent: 0 });
        }

        // Filter out sender's own subscriptions and muted users
        const targetSubs = subsSnapshot.docs.filter(doc => {
            const data = doc.data();
            return data.userId !== senderUid && data.muteItemAdd !== true;
        });

        if (targetSubs.length === 0) {
            return res.status(200).json({ success: true, pushesSent: 0 });
        }

        // Configure VAPID
        webpush.setVapidDetails(
            (process.env.VAPID_SUBJECT || 'mailto:support@listnest.co.il').trim(),
            (process.env.VAPID_PUBLIC_KEY || '').trim(),
            (process.env.VAPID_PRIVATE_KEY || '').trim()
        );

        const results = { pushesSent: 0, pushesFailed: 0, staleRemoved: 0 };
        const truncatedItems = itemNames ? itemNames.substring(0, 100) : '';

        for (const subDoc of targetSubs) {
            const subData = subDoc.data();
            const lang = subData.language || 'he';
            const titleFn = titles[lang] || titles.he;

            const pushPayload = JSON.stringify({
                title: titleFn(senderName),
                body: truncatedItems,
                lang: lang,
                tag: `item-add-${familyId}`
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
                if (pushError.statusCode === 410 || pushError.statusCode === 404) {
                    await subDoc.ref.delete();
                    results.staleRemoved++;
                } else {
                    results.pushesFailed++;
                }
            }
        }

        return res.status(200).json({ success: true, ...results });
    } catch (error) {
        console.error('Item add push error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
