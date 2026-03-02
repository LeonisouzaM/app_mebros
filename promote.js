import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_JHmTX4Vty9LZ@ep-broad-snow-ai9dqkqn-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function run() {
    const account1 = 'certificacionsuporte@proton.me';
    const account2 = 'aluno@teste.com';

    await sql`UPDATE users SET role = 'admin' WHERE email IN (${account1}, ${account2})`;
    console.log(`Sucesso! Contas promovidas a ADMIN no banco: ${account1}, ${account2}`);
}

run().catch(console.error);
