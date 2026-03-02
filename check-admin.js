import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_JHmTX4Vty9LZ@ep-broad-snow-ai9dqkqn-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function check() {
    const users = await sql`SELECT email, role FROM users WHERE email = 'admin@admin.com'`;
    console.log('--- ADMIN CHECK ---');
    if (users.length === 0) {
        console.log('Uuário admin@admin.com NÃO ENCONTRADO no banco!');
    } else {
        console.log(`Usuário: ${users[0].email} | Role: ${users[0].role}`);
    }
}

check().catch(console.error);
