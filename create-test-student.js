import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_JHmTX4Vty9LZ@ep-broad-snow-ai9dqkqn-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function run() {
    const email = 'teste@aluno.com';

    // 1. Criar o usuário
    const userResult = await sql`
    INSERT INTO users (email, role, name)
    VALUES (${email}, 'student', 'Aluno de Teste')
    ON CONFLICT (email) DO UPDATE SET role = 'student'
    RETURNING id
  `;

    const userId = userResult[0].id;
    console.log(`Usuário ${email} (ID: ${userId}) criado/atualizado.`);

    // 2. Dar acesso a todos os produtos existentes para o teste ser completo
    const products = await sql`SELECT id FROM products`;

    for (const p of products) {
        await sql`
      INSERT INTO product_access (user_id, product_id)
      VALUES (${userId}, ${p.id})
      ON CONFLICT DO NOTHING
    `;
        console.log(`Acesso liberado para o produto: ${p.id}`);
    }

    console.log('--- TESTE PRONTO ---');
    console.log('E-mail: teste@aluno.com');
    console.log('Cargo: Aluno (Padrão)');
}

run().catch(console.error);
