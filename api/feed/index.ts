import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        await initDb();

        const { productId } = req.query;

        if (req.method === 'GET') {
            let posts;
            if (productId) {
                posts = await sql`SELECT * FROM feed_posts WHERE product_id = ${String(productId)} ORDER BY created_at DESC`;
            } else {
                posts = await sql`SELECT * FROM feed_posts ORDER BY created_at DESC LIMIT 50`;
            }

            const mapped = posts.map(p => ({
                id: String(p.id),
                title: p.title,
                description: p.description,
                productId: p.product_id,
                createdAt: p.created_at
            }));
            return res.status(200).json(mapped);
        }

        if (req.method === 'POST') {
            const { title, description, productId } = req.body;
            if (!title || !productId) return res.status(400).json({ error: 'Título e ProductId são obrigatórios' });

            await sql`
                INSERT INTO feed_posts (title, description, product_id)
                VALUES (${title}, ${description}, ${productId})
            `;
            return res.status(200).json({ message: 'Post criado' });
        }

        if (req.method === 'DELETE') {
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
