import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../db.js';
import { signToken } from '../_lib/authMiddleware.js';

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
            WHERE email = ${email}
        `;

        if (userResult.length === 0) {
            return res.status(401).json({ error: 'E-mail não cadastrado ou compra não aprovada.' });
        }

        const user = userResult[0];

        // Fetch user's products
        const accessResult = await sql`
            SELECT product_id 
            FROM product_access 
            WHERE user_id = ${user.id}
        `;

        const accessibleProducts = accessResult.map(row => row.product_id);

        // Generate signed JWT token
        const token = signToken({
            userId: user.id.toString(),
            email: user.email,
            role: user.role,
        });

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
