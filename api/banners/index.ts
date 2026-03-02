import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../db.js';
import { requireAuth, requireAdmin } from '../_lib/authMiddleware.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        await initDb();

        if (req.method === 'GET') {
            const auth = requireAuth(req, res);
            if (!auth) return;

            const banners = await sql`SELECT url FROM system_banners ORDER BY id ASC`;
            return res.status(200).json(banners.map(b => b.url));
        }

        if (req.method === 'POST') {
            const auth = requireAdmin(req, res);
            if (!auth) return;

            const { banners } = req.body;
            if (!Array.isArray(banners)) return res.status(400).json({ error: 'Formato inválido' });

            await sql`DELETE FROM system_banners`;
            for (const url of banners) {
                await sql`INSERT INTO system_banners (url) VALUES (${url})`;
            }

            return res.status(200).json({ message: 'Banners salvos' });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (error: any) {
        return res.status(500).json({ error: 'Erro nos banners', details: error.message });
    }
}
