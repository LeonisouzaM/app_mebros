import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        await initDb();

        const { productId } = req.query;

        if (req.method === 'GET') {
            let comments;
            if (productId) {
                comments = await sql`SELECT * FROM comments WHERE product_id = ${String(productId)} ORDER BY created_at DESC`;
            } else {
                comments = await sql`SELECT * FROM comments ORDER BY created_at DESC LIMIT 100`;
            }

            const mapped = comments.map(c => ({
                id: String(c.id),
                userName: c.user_name,
                userPhoto: c.user_photo,
                text: c.text,
                productId: c.product_id,
                createdAt: c.created_at
            }));
            return res.status(200).json(mapped);
        }

        if (req.method === 'POST') {
            const { userName, userPhoto, text, productId } = req.body;
            if (!userName || !text || !productId) return res.status(400).json({ error: 'Dados incompletos' });

            await sql`
                INSERT INTO comments (user_name, user_photo, text, product_id)
                VALUES (${userName}, ${userPhoto}, ${text}, ${productId})
            `;
            return res.status(200).json({ message: 'Comentário enviado' });
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'ID necessário' });
            await sql`DELETE FROM comments WHERE id = ${Number(id)}`;
            return res.status(200).json({ message: 'Comentário removido' });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (error: any) {
        return res.status(500).json({ error: 'Erro na comunidade', details: error.message });
    }
}
