import express from 'express';
import cors from 'cors';
import sql, { initDb } from './db';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// Test route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor rodando e Neon conectado!' });
});

// ---- HOTMART WEBHOOK ROUTE ---- //
app.post('/api/webhook/hotmart', async (req, res) => {
    try {
        const payload = req.body;

        // 1. Validate Hotmart Token (Hottok)
        // You should set this in your .env file: HOTMART_HOTTOK=your_token_here
        const hottok = req.headers['x-hotmart-hottok'] || req.query.hottok || payload.hottok;
        if (process.env.HOTMART_HOTTOK && hottok !== process.env.HOTMART_HOTTOK) {
            console.warn('Alerta: Token Hottok inválido recebido!');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        console.log('Webhook Recebido da Hotmart:', JSON.stringify(payload, null, 2));

        // Let's assume Hotmart sends the events in API v2 format
        // 'compra_aprovada' or equivalent depending on your setup

        // Hotmart usually sends user info inside `buyer` or `data.buyer`
        const eventType = payload.event;
        const status = payload.status || payload.data?.status; // e.g., 'APPROVED', 'COMPLETED'

        // Extract buyer info
        const email = payload.data?.buyer?.email || payload.email;
        let name = payload.data?.buyer?.name || payload.name || email.split('@')[0];
        const transactionId = payload.data?.purchase?.transaction || payload.transaction;
        const productIdHotmart = payload.data?.product?.id || payload.product_id;

        // If the purchase is approved/completed, we grant access
        if (eventType === 'PURCHASE_APPROVED' || status === 'APPROVED' || status === 'COMPLETED' || payload.status === 'approved') {
            if (!email) {
                return res.status(400).json({ error: 'Email não fornecido no payload.' });
            }

            // 1. Create user if they don't exist
            const dbUsers = await sql`SELECT id FROM users WHERE email = ${email}`;
            let userId;

            if (dbUsers.length === 0) {
                // User doesn't exist, let's create them
                const photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff`;
                const result = await sql`
                    INSERT INTO users (email, name, role, photo) 
                    VALUES (${email}, ${name}, 'student', ${photo}) 
                    RETURNING id
                `;
                userId = result[0].id;
                console.log(`Novo aluno criado: ${email}`);
            } else {
                userId = dbUsers[0].id;
                console.log(`Aluno já existe: ${email}`);
            }

            // 2. Grant access to a specific product
            // Aqui estamos assumindo que por enquanto vamos dar acesso a um produto "default" 
            // ou você pode mapear os IDs da Hotmart para os IDs do seu sistema.
            const systemProductId = 'default'; // Substitua por lógica de mapeamento se tiver vários

            // Tenta inserir a permissão (ignora se já tiver)
            await sql`
                INSERT INTO product_access (user_id, product_id, transaction_id)
                VALUES (${userId}, ${systemProductId}, ${transactionId})
                ON CONFLICT (user_id, product_id) DO NOTHING
            `;

            console.log(`Acesso liberado para: ${email} -> Produto: ${systemProductId}`);
        }

        res.status(200).json({ message: 'Webhook processado com sucesso.' });
    } catch (error) {
        console.error('Erro ao processar Webhook Hotmart:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

// Inicia servidor e sincroniza banco de dados
const PORT = process.env.PORT || 3001;

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}).catch(err => {
    console.error('Erro ao inicializar banco de dados:', err);
});
