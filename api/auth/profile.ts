import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

interface AuthPayload { userId: string; email: string; role: string; }

function requireAuth(req: VercelRequest, res: VercelResponse): AuthPayload | false {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Não autorizado' });
        return false;
    }
    try {
        return jwt.verify(authHeader.slice(7), JWT_SECRET) as AuthPayload;
    } catch {
        res.status(401).json({ error: 'Token inválido' });
        return false;
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST' && req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        await initDb();
        const auth = requireAuth(req, res);
        if (!auth) return;

        const { name, photo } = req.body;

        if (photo) {
            await sql`
                UPDATE users 
                SET photo = ${photo} 
                WHERE id = ${Number(auth.userId)}
            `;

            // Também atualizar as fotos nos comentários antigos para manter consistência visual na comunidade
            await sql`
                UPDATE comments 
                SET user_photo = ${photo} 
                WHERE user_email = ${auth.email}
            `;
        }

        if (name) {
            await sql`
                UPDATE users 
                SET name = ${name} 
                WHERE id = ${Number(auth.userId)}
            `;

            await sql`
                UPDATE comments 
                SET user_name = ${name} 
                WHERE user_email = ${auth.email}
            `;
        }

        const updatedUser = await sql`
            SELECT id, email, name, role, photo 
            FROM users 
            WHERE id = ${Number(auth.userId)}
        `;

        return res.status(200).json({
            message: 'Perfil atualizado com sucesso',
            user: {
                ...updatedUser[0],
                id: updatedUser[0].id.toString()
            }
        });

    } catch (error: any) {
        console.error('Erro ao atualizar perfil:', error);
        return res.status(500).json({ error: 'Erro ao atualizar perfil', details: error.message });
    }
}
