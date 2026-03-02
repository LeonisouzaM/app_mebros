import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        await initDb();

        if (req.method === 'GET') {
            const classes = await sql`SELECT * FROM classes ORDER BY created_at DESC`;
            const mappedClasses = classes.map(c => ({
                id: c.id,
                title: c.title,
                cloudinaryUrl: c.cloudinary_url,
                coverUrl: c.cover_url,
                description: c.description,
                buttonText: c.button_text,
                productId: c.product_id,
                unlockDate: c.unlock_date,
                createdAt: c.created_at
            }));
            return res.status(200).json(mappedClasses);
        }

        if (req.method === 'POST') {
            const { id, title, cloudinaryUrl, coverUrl, description, buttonText, productId, unlockDate } = req.body;

            if (!title || !cloudinaryUrl) return res.status(400).json({ error: 'Título e URL são obrigatórios' });

            const classId = id || `class_${Date.now()}`;

            await sql`
                INSERT INTO classes (id, title, cloudinary_url, cover_url, description, button_text, product_id, unlock_date)
                VALUES (${classId}, ${title}, ${cloudinaryUrl}, ${coverUrl}, ${description}, ${buttonText}, ${productId}, ${unlockDate})
                ON CONFLICT (id) DO UPDATE SET
                    title = EXCLUDED.title,
                    cloudinary_url = EXCLUDED.cloudinary_url,
                    cover_url = EXCLUDED.cover_url,
                    description = EXCLUDED.description,
                    button_text = EXCLUDED.button_text,
                    product_id = EXCLUDED.product_id,
                    unlock_date = EXCLUDED.unlock_date
            `;

            return res.status(200).json({ message: 'Aula salva', id: classId });
        }

        if (req.method === 'DELETE') {
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
