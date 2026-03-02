import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../db.js';
import { requireAuth, requireAdmin } from '../_lib/authMiddleware.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        await initDb();

        if (req.method === 'GET') {
            // Qualquer usuário autenticado pode ver produtos
            const auth = requireAuth(req, res);
            if (!auth) return;

            const products = await sql`SELECT * FROM products ORDER BY created_at DESC`;
            const mappedProducts = products.map(p => ({
                id: p.id,
                name: p.name,
                description: p.description,
                coverUrl: p.cover_url,
                language: p.language,
                supportNumber: p.support_number,
                hotmartId: p.hotmart_id,
                banners: p.banners,
                createdAt: p.created_at
            }));
            return res.status(200).json(mappedProducts);
        }

        if (req.method === 'POST') {
            // Apenas admin pode criar/editar produtos
            const auth = requireAdmin(req, res);
            if (!auth) return;

            const { id, name, description, coverUrl, language, supportNumber, hotmartId, banners } = req.body;

            if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });

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

            return res.status(200).json({ message: 'Produto salvo com sucesso', id: productId });
        }

        if (req.method === 'DELETE') {
            // Apenas admin pode deletar produtos
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
