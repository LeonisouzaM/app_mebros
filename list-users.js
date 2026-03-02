import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_JHmTX4Vty9LZ@ep-broad-snow-ai9dqkqn-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function check() {
    const users = await sql`SELECT email, role FROM users`;
    console.log('LISTA DE USUÁRIOS:');
    for (const u of users) {
        console.log(`- ${u.email} [${u.role}]`);
    }
}

check().catch(console.error);
