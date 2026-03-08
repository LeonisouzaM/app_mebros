import webpush from 'web-push';
import { sql } from '../db.js';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BHLrZfkeLqHRN13-ffnSucHtJYFqNf5oxOduH6HQzRUsgjC39KCGGGXOAkuu6qFtpchHmi3nPZvjfYFz46WAI-fo';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '2lu9tI-jVP9s7WumyJixGeOz1Lt_EqD6YPOdCDAMyt8';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:suporte@areamembros.com';

webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

export async function sendPushNotification(title: string, body: string, url: string, excludeEmail?: string) {
    try {
        const subscriptionsResult = await sql`
            SELECT id, user_email, endpoint, p256dh, auth
            FROM push_subscriptions
            ${excludeEmail ? sql`WHERE user_email != ${excludeEmail}` : sql``}
        `;

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
