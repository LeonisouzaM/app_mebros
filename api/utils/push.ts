import webpush from 'web-push';
import { sql } from '../db.js';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:suporte@areamembros.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    try {
        webpush.setVapidDetails(
            VAPID_SUBJECT,
            VAPID_PUBLIC_KEY,
            VAPID_PRIVATE_KEY
        );
    } catch (e: any) {
        console.warn('Erro ao configurar chaves VAPID (Push):', e?.message);
    }
} else {
    console.warn('Chaves VAPID ausentes ou inválidas. Push Notifications desabilitadas.');
}

export async function sendPushNotification(title: string, body: string, url: string, excludeEmail?: string) {
    try {
        let subscriptionsResult;
        if (excludeEmail) {
            subscriptionsResult = await sql`
                SELECT id, user_email, endpoint, p256dh, auth
                FROM push_subscriptions
                WHERE user_email != ${excludeEmail}
            `;
        } else {
            subscriptionsResult = await sql`
                SELECT id, user_email, endpoint, p256dh, auth
                FROM push_subscriptions
            `;
        }

        if (subscriptionsResult.length === 0) return;

        const payload = JSON.stringify({
            title,
            body,
            url
        });

        const promises = subscriptionsResult.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                }
            };

            try {
                await webpush.sendNotification(pushSubscription, payload);
            } catch (error: any) {
                if (error.statusCode === 404 || error.statusCode === 410) {
                    await sql`DELETE FROM push_subscriptions WHERE endpoint = ${sub.endpoint}`;
                } else {
                    console.error('Error sending push notification:', error);
                }
            }
        });

        await Promise.all(promises);
    } catch (error) {
        console.error('Error in sendPushNotification:', error);
    }
}
