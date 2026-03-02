import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_JHmTX4Vty9LZ@ep-broad-snow-ai9dqkqn-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function check() {
    const users = await sql`SELECT * FROM users`;
    const access = await sql`SELECT * FROM product_access`;

    console.log('=== DATA DUMP ===');
    console.log(JSON.stringify({ users, access }, null, 2));
}

check().catch(console.error);
