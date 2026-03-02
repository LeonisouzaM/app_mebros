import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

interface AuthPayload { userId: string; email: string; role: string; }

function requireAuth(req: VercelRequest, res: VercelResponse): AuthPayload | false {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Não autorizado. Token ausente.' });
        return false;
    }
    try {
        return jwt.verify(authHeader.slice(7), JWT_SECRET) as AuthPayload;
    } catch {
        res.status(401).json({ error: 'Não autorizado. Token inválido.' });
        return false;
    }
}

function requireAdmin(req: VercelRequest, res: VercelResponse): AuthPayload | false {
    const auth = requireAuth(req, res);
    if (!auth) return false;
    if (auth.role !== 'admin') {
        res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        return false;
    }
    return auth;
}

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
