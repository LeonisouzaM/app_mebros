import { neon } from '@neondatabase/serverless';
import { writeFileSync } from 'fs';

const sql = neon('postgresql://neondb_owner:npg_JHmTX4Vty9LZ@ep-broad-snow-ai9dqkqn-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function run() {
    const targetEmail = 'certificacionsuporte@proton.me';
    const correctProductId = 'prod_1772413031703'; // ID real do Mounjaro no banco
    const wrongProductId = '7305069';            // hotmart_id que estava salvo errado

    // 1. Garantir role = student
    await sql`UPDATE users SET role = 'student' WHERE email = ${targetEmail}`;

    // 2. Buscar user
    const users = await sql`SELECT id FROM users WHERE email = ${targetEmail}`;
    if (users.length === 0) { console.log('Usuário não encontrado!'); return; }
    const userId = users[0].id;

    // 3. Remover acesso com id errado (hotmart_id)
    await sql`DELETE FROM product_access WHERE user_id = ${userId} AND product_id = ${wrongProductId}`;

    // 4. Garantir acesso com id correto (sem duplicar)
    const existing = await sql`SELECT 1 FROM product_access WHERE user_id = ${userId} AND product_id = ${correctProductId}`;
    if (existing.length === 0) {
        await sql`INSERT INTO product_access (user_id, product_id) VALUES (${userId}, ${correctProductId})`;
    }

    // 5. Verificar resultado final
    const finalUser = await sql`SELECT email, role FROM users WHERE id = ${userId}`;
    const finalAccess = await sql`SELECT product_id FROM product_access WHERE user_id = ${userId}`;
    const products = await sql`SELECT id, name FROM products WHERE id = ${correctProductId}`;

    const result = {
        usuario: finalUser[0],
        acesso: finalAccess,
        produto: products[0]
    };
    writeFileSync('fix-result.txt', JSON.stringify(result, null, 2));
    console.log('✅ CORREÇÃO APLICADA — veja fix-result.txt');
}

run().catch(console.error);
