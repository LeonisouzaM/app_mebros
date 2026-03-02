import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../db.js';
import { requireAuth, requireAdmin } from '../_lib/authMiddleware.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        await initDb();

        const { productId, action, email } = req.query;

        if (req.method === 'GET') {
            const auth = requireAuth(req, res);
            if (!auth) return;

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

            // Fetch likes for the current user (use email from verified token payload)
            let userLikes = new Set();
            const userEmail = auth.email;
            if (userEmail) {
                const likedList = await sql`SELECT comment_id FROM comment_likes WHERE user_email = ${userEmail}`;
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
            const auth = requireAuth(req, res);
            if (!auth) return;

            if (action === 'like') {
                const { commentId } = req.body;
                // Use the email from the verified token — never from the client body
                const userEmail = auth.email;
                if (!commentId) return res.status(400).json({ error: 'Dados incompletos' });

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

            // Create comment — use userName/userPhoto from body, but userEmail from token
            const { userName, userPhoto, text, imageUrl, productId: bodyProductId, parentId } = req.body;
            const userEmail = auth.email;
            if (!userName || !text || !bodyProductId) return res.status(400).json({ error: 'Dados incompletos' });

            await sql`
                INSERT INTO comments (user_name, user_photo, user_email, text, image_url, product_id, parent_id)
                VALUES (${userName}, ${userPhoto}, ${userEmail}, ${text}, ${imageUrl || null}, ${bodyProductId}, ${parentId ? Number(parentId) : null})
            `;
            return res.status(200).json({ message: 'Comentário enviado' });
        }

        if (req.method === 'DELETE') {
            const auth = requireAuth(req, res);
            if (!auth) return;

            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'ID necessário' });

            // Students can only delete their own comments. Admins can delete any.
            if (auth.role !== 'admin') {
                const comment = await sql`SELECT user_email FROM comments WHERE id = ${Number(id)}`;
                if (comment.length === 0) return res.status(404).json({ error: 'Comentário não encontrado' });
                if (comment[0].user_email !== auth.email) {
                    return res.status(403).json({ error: 'Você não tem permissão para remover este comentário' });
                }
            }

            await sql`DELETE FROM comments WHERE id = ${Number(id)}`;
            return res.status(200).json({ message: 'Comentário removido' });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (error: any) {
        return res.status(500).json({ error: 'Erro na comunidade', details: error.message });
    }
}
