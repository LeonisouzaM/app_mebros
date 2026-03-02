import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_JHmTX4Vty9LZ@ep-broad-snow-ai9dqkqn-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function run() {
    const email = 'admin@admin.com';

    // Upsert user
    await sql`
    INSERT INTO users (email, role, name)
    VALUES (${email}, 'admin', 'Administrador')
    ON CONFLICT (email) DO UPDATE SET role = 'admin'
  `;
    console.log(`Sucesso! admin@admin.com agora existe e é ADMIN no banco.`);
}

run().catch(console.error);
