import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_JHmTX4Vty9LZ@ep-broad-snow-ai9dqkqn-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function check() {
    const products = await sql`SELECT id, name, language FROM products`;
    console.log('=== PRODUCTS ===');
    console.log(JSON.stringify(products, null, 2));
}

check().catch(console.error);
