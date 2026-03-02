import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        await initDb();

        const { productId, action, commentId, email } = req.query;

        if (req.method === 'GET') {
            let posts;
            if (productId) {
                posts = await sql`
                    SELECT * FROM comments 
                    WHERE product_id = ${String(productId)} AND parent_id IS NULL 
                    ORDER BY created_at DESC
                `;
            } else {
                posts = await sql`
                    SELECT * FROM comments 
                    WHERE parent_id IS NULL 
                    ORDER BY created_at DESC 
                    LIMIT 100
                `;
            }

            // Fetch all replies for these posts
            const postIds = posts.map(p => p.id);
            let allReplies: any[] = [];
            if (postIds.length > 0) {
                allReplies = await sql`
                    SELECT * FROM comments 
                    WHERE parent_id IN (${postIds.join(',')})
                    ORDER BY created_at ASC
                `;
            }

            // Fetch likes for the current user if email is provided
            let userLikes = new Set();
            if (email) {
                const likedList = await sql`SELECT comment_id FROM comment_likes WHERE user_email = ${String(email)}`;
                likedList.forEach(l => userLikes.add(l.comment_id));
            }

            const mapped = posts.map(c => ({
                id: String(c.id),
                userName: c.user_name,
                userPhoto: c.user_photo,
                userEmail: c.user_email,
                text: c.text,
                imageUrl: c.image_url,
                productId: c.product_id,
                parentId: c.parent_id,
                likesCount: c.likes_count || 0,
                hasLiked: userLikes.has(c.id),
                createdAt: c.created_at,
                replies: allReplies
                    .filter(r => r.parent_id === c.id)
                    .map(r => ({
                        id: String(r.id),
                        userName: r.user_name,
                        userPhoto: r.user_photo,
                        text: r.text,
                        createdAt: r.created_at
                    }))
            }));
            return res.status(200).json(mapped);
        }

        if (req.method === 'POST') {
            if (action === 'like') {
                const { commentId, userEmail } = req.body;
                if (!commentId || !userEmail) return res.status(400).json({ error: 'Dados incompletos' });

                // Toggle like
                const existing = await sql`SELECT id FROM comment_likes WHERE comment_id = ${Number(commentId)} AND user_email = ${userEmail}`;
                if (existing.length > 0) {
                    await sql`DELETE FROM comment_likes WHERE id = ${existing[0].id}`;
                    await sql`UPDATE comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = ${Number(commentId)}`;
                    return res.status(200).json({ status: 'unliked' });
                } else {
                    await sql`INSERT INTO comment_likes (comment_id, user_email) VALUES (${Number(commentId)}, ${userEmail})`;
                    await sql`UPDATE comments SET likes_count = likes_count + 1 WHERE id = ${Number(commentId)}`;
                    return res.status(200).json({ status: 'liked' });
                }
            }

            const { userName, userPhoto, userEmail, text, imageUrl, productId, parentId } = req.body;
            if (!userName || !text || !productId) return res.status(400).json({ error: 'Dados incompletos' });

            await sql`
                INSERT INTO comments (user_name, user_photo, user_email, text, image_url, product_id, parent_id)
                VALUES (${userName}, ${userPhoto}, ${userEmail}, ${text}, ${imageUrl || null}, ${productId}, ${parentId ? Number(parentId) : null})
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
