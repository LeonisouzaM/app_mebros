import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        await initDb();

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email é obrigatório' });
        }

        // Check if user exists
        const userResult = await sql`
            SELECT id, email, name, role, photo 
            FROM users 
            WHERE LOWER(email) = LOWER(TRIM(${email}))
        `;

        if (userResult.length === 0) {
            return res.status(401).json({ error: 'E-mail não cadastrado ou compra não aprovada.' });
        }

        const user = userResult[0];

        // Fetch user's products (using hotmart_id from products table for frontend comparison)
        const accessResult = await sql`
            SELECT COALESCE(p.hotmart_id, pa.product_id) as product_id
            FROM product_access pa
            LEFT JOIN products p ON pa.product_id = p.id
            WHERE pa.user_id = ${user.id}
        `;

        const accessibleProducts = accessResult.map(row => String(row.product_id));

        // Generate signed JWT token
        const token = jwt.sign(
            { userId: user.id.toString(), email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            token,
            user: {
                id: user.id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                photo: user.photo,
                accessibleProducts,
            }
        });
    } catch (error: any) {
        console.error('Erro no login:', error);
        return res.status(500).json({
            error: 'Erro interno no servidor de login',
            details: error?.message || 'Desconhecido'
        });
    }
}
