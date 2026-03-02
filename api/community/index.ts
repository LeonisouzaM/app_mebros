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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        await initDb();

        const { productId, action } = req.query;

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

            const postIds = posts.map(p => p.id);
            let allReplies: any[] = [];
            if (postIds.length > 0) {
                allReplies = await sql`
                    SELECT * FROM comments 
                    WHERE parent_id IN (${postIds.join(',')})
                    ORDER BY created_at ASC
                `;
            }

            // Usar email do token para buscar likes
            let userLikes = new Set();
            const likedList = await sql`SELECT comment_id FROM comment_likes WHERE user_email = ${auth.email}`;
            likedList.forEach(l => userLikes.add(l.comment_id));

            return res.status(200).json(posts.map(c => ({
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
            })));
        }

        if (req.method === 'POST') {
            const auth = requireAuth(req, res);
            if (!auth) return;

            if (action === 'like') {
                const { commentId } = req.body;
                const userEmail = auth.email; // sempre do token
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

            const { userName, userPhoto, text, imageUrl, productId: bodyProductId, parentId } = req.body;
            const userEmail = auth.email; // email do token, não do body
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

            if (auth.role !== 'admin') {
                const comment = await sql`SELECT user_email FROM comments WHERE id = ${Number(id)}`;
                if (comment.length === 0) return res.status(404).json({ error: 'Comentário não encontrado' });
                if (comment[0].user_email !== auth.email) {
                    return res.status(403).json({ error: 'Sem permissão para remover este comentário' });
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
