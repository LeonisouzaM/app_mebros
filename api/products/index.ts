import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../db.js';
import jwt from 'jsonwebtoken';
import { sendPushNotification } from '../utils/push.js';

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

            const products = await sql`SELECT * FROM products ORDER BY created_at DESC`;
            return res.status(200).json(products.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                coverUrl: p.cover_url,
                language: p.language,
                supportNumber: p.support_number,
                hotmartId: p.hotmart_id,
                banners: p.banners,
                createdAt: p.created_at
            })));
        }

        if (req.method === 'POST') {
            const auth = requireAdmin(req, res);
            if (!auth) return;

            const { id, name, description, coverUrl, language, supportNumber, hotmartId, banners } = req.body;
            if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });

            const isNewProduct = !id;
            const productId = id || `prod_${Date.now()}`;
            await sql`
                INSERT INTO products (id, name, description, cover_url, language, support_number, hotmart_id, banners)
                VALUES (${productId}, ${name}, ${description}, ${coverUrl}, ${language}, ${supportNumber}, ${hotmartId}, ${banners || []})
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    cover_url = EXCLUDED.cover_url,
                    language = EXCLUDED.language,
                    support_number = EXCLUDED.support_number,
                    hotmart_id = EXCLUDED.hotmart_id,
                    banners = EXCLUDED.banners
            `;

            if (isNewProduct) {
                sendPushNotification(
                    'Novo produto disponível!',
                    `O curso/produto "${name}" acaba de ser adicionado à plataforma.`,
                    `/`
                ).catch(err => console.error('Push error:', err));
            }

            return res.status(200).json({ message: 'Produto salvo com sucesso', id: productId });
        }

        if (req.method === 'DELETE') {
            const auth = requireAdmin(req, res);
            if (!auth) return;

            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'ID é obrigatório' });
            await sql`DELETE FROM products WHERE id = ${String(id)}`;
            return res.status(200).json({ message: 'Produto removido' });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (error: any) {
        console.error('API Products Error:', error);
        return res.status(500).json({ error: 'Erro na API de produtos', details: error.message });
    }
}
