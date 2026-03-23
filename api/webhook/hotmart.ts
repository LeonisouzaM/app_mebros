import { VercelRequest, VercelResponse } from '@vercel/node';
import { sql, initDb } from '../db.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed - Only POST is accepted' });
    }

    try {
        await initDb(); // Ensures table exists

        const payload = req.body;

        // 1. Validate Hotmart Token (Hottok)
        const hottok = req.headers['x-hotmart-hottok'] || req.query.hottok || payload?.hottok;
        if (process.env.HOTMART_HOTTOK && hottok !== process.env.HOTMART_HOTTOK) {
            console.warn('Alerta: Token Hottok inválido recebido!');
            return res.status(401).json({ error: 'Unauthorized: Invalid Hottok' });
        }

        console.log('Webhook Recebido da Hotmart:', JSON.stringify(payload, null, 2));

        const eventType = payload?.event?.toUpperCase();
        const status = (payload?.status || payload?.data?.status)?.toUpperCase();

        const email = payload?.data?.buyer?.email || payload?.email;
        let name = payload?.data?.buyer?.name || payload?.name || email?.split('@')[0];
        const transactionId = payload?.data?.purchase?.transaction || payload?.transaction;
        const productIdHotmart = payload?.data?.product?.id || payload?.product_id;

        const isApproved = eventType === 'PURCHASE_APPROVED' ||
            eventType === 'COMPRA_APROVADA' ||
            status === 'APPROVED' ||
            status === 'COMPLETED';

        if (isApproved) {
            if (!email) {
                return res.status(400).json({ error: 'Email não fornecido no payload.' });
            }

            const dbUsers = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(TRIM(${email}))`;
            let userId;

            if (dbUsers.length === 0) {
                const photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff`;
                const result = await sql`
                    INSERT INTO users (email, name, role, photo) 
                    VALUES (${email}, ${name}, 'student', ${photo}) 
                    RETURNING id
                `;
                userId = result[0].id;
                console.log(`Novo aluno criado via Webhook: ${email}`);
            } else {
                userId = dbUsers[0].id;
                console.log(`Aluno já existe via Webhook: ${email}`);
            }

            const systemProductId = String(productIdHotmart || 'default');
            
            if (productIdHotmart) {
                console.log(`Produto recebido da Hotmart: ${systemProductId}`);
                // Não precisamos mais vincular ao UUID interno aqui.
                // Ao salvar o hotmart_id puro em product_access, o frontend 
                // sempre vai cruzar essa chave com o hotmart_id do produto atual.
            }

            await sql`
                INSERT INTO product_access (user_id, product_id, transaction_id)
                VALUES (${userId}, ${systemProductId}, ${transactionId})
                ON CONFLICT (user_id, product_id) DO NOTHING
            `;

            console.log(`Acesso liberado para: ${email} | produto: ${systemProductId}`);
        } else {
            console.log(`Ignorando evento não-compra ou não-aprovado: eventType=${eventType}, status=${status}`);
        }

        return res.status(200).json({ message: 'Webhook processado com sucesso!!' });
    } catch (error: any) {
        console.error('Erro ao processar Webhook Hotmart:', error);
        return res.status(500).json({
            error: 'Erro interno no servidor webhook',
            details: error?.message || 'Desconhecido'
        });
    }
}
