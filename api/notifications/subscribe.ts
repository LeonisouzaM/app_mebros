import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        await initDb();
        const { subscription, email } = req.body;

        if (!subscription || !email) {
            return res.status(400).json({ error: 'Subscription and email are required' });
        }

        const endpoint = subscription.endpoint;
        const p256dh = subscription.keys?.p256dh;
        const auth = subscription.keys?.auth;

        if (!endpoint || !p256dh || !auth) {
            return res.status(400).json({ error: 'Invalid subscription object' });
        }

        // Check if subscription already exists for this endpoint
        const existing = await sql`
            SELECT id FROM push_subscriptions WHERE endpoint = ${endpoint}
        `;

        if (existing.length === 0) {
            await sql`
                INSERT INTO push_subscriptions (user_email, endpoint, p256dh, auth)
                VALUES (${email}, ${endpoint}, ${p256dh}, ${auth})
            `;
        } else {
            // Update email if it changed for the same endpoint
            await sql`
                UPDATE push_subscriptions SET user_email = ${email} WHERE endpoint = ${endpoint}
            `;
        }

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Error subscribing:', error);
        return res.status(500).json({ error: 'Internal server error', details: error?.message });
    }
}
