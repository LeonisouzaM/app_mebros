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

            const classes = await sql`SELECT * FROM classes ORDER BY created_at DESC`;
            return res.status(200).json(classes.map(c => ({
                id: c.id,
                title: c.title,
                cloudinaryUrl: c.cloudinary_url,
                coverUrl: c.cover_url,
                description: c.description,
                buttonText: c.button_text,
                productId: c.product_id,
                unlockDate: c.unlock_date,
                type: c.type,
                attachmentUrl: c.attachment_url,
                createdAt: c.created_at
            })));
        }

        if (req.method === 'POST') {
            const auth = requireAdmin(req, res);
            if (!auth) return;

            const { id, title, cloudinaryUrl, coverUrl, description, buttonText, productId, unlockDate, type, attachmentUrl } = req.body;
            if (!title || !cloudinaryUrl) return res.status(400).json({ error: 'Título e URL são obrigatórios' });

            const classId = id || `class_${Date.now()}`;
            await sql`
                INSERT INTO classes (id, title, cloudinary_url, cover_url, description, button_text, product_id, unlock_date, type, attachment_url)
                VALUES (${classId}, ${title}, ${cloudinaryUrl}, ${coverUrl}, ${description}, ${buttonText}, ${productId}, ${unlockDate}, ${type}, ${attachmentUrl})
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    cloudinary_url = EXCLUDED.cloudinary_url,
                    cover_url = EXCLUDED.cover_url,
                    description = EXCLUDED.description,
                    button_text = EXCLUDED.button_text,
                    product_id = EXCLUDED.product_id,
                    unlock_date = EXCLUDED.unlock_date,
                    type = EXCLUDED.type,
                    attachment_url = EXCLUDED.attachment_url
            `;
            return res.status(200).json({ message: 'Aula salva', id: classId });
        }

        if (req.method === 'DELETE') {
            const auth = requireAdmin(req, res);
            if (!auth) return;

            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'ID é obrigatório' });
            await sql`DELETE FROM classes WHERE id = ${String(id)}`;
            return res.status(200).json({ message: 'Aula removida' });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (error: any) {
        console.error('API Classes Error:', error);
        return res.status(500).json({ error: 'Erro na API de aulas', details: error.message });
    }
}
