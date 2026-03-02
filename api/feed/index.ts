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

        const { productId } = req.query;

        if (req.method === 'GET') {
            const auth = requireAuth(req, res);
            if (!auth) return;

            let posts;
            if (productId) {
                posts = await sql`SELECT * FROM feed_posts WHERE product_id = ${String(productId)} ORDER BY created_at DESC`;
            } else {
                posts = await sql`SELECT * FROM feed_posts ORDER BY created_at DESC LIMIT 50`;
            }

            return res.status(200).json(posts.map(p => ({
                id: String(p.id),
                title: p.title,
                description: p.description,
                productId: p.product_id,
                createdAt: p.created_at
            })));
        }

        if (req.method === 'POST') {
            const auth = requireAdmin(req, res);
            if (!auth) return;

            const { title, description, productId: bodyProductId } = req.body;
            if (!title || !bodyProductId) return res.status(400).json({ error: 'Título e ProductId são obrigatórios' });

            await sql`
                INSERT INTO feed_posts (title, description, product_id)
                VALUES (${title}, ${description}, ${bodyProductId})
            `;
            return res.status(200).json({ message: 'Post criado' });
        }

        if (req.method === 'DELETE') {
            const auth = requireAdmin(req, res);
            if (!auth) return;

            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'ID é obrigatório' });
            await sql`DELETE FROM feed_posts WHERE id = ${Number(id)}`;
            return res.status(200).json({ message: 'Post removido' });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (error: any) {
        return res.status(500).json({ error: 'Erro no feed', details: error.message });
    }
}
