import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_JHmTX4Vty9LZ@ep-broad-snow-ai9dqkqn-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function check() {
    const products = await sql`SELECT * FROM products`;
    console.log('=== PRODUCTS IN DB ===');
    console.log(JSON.stringify(products, null, 2));

    const access = await sql`
    SELECT u.email, a.product_id 
    FROM users u 
    JOIN product_access a ON u.id = a.user_id
  `;
    console.log('\n=== USER ACCESS MAP ===');
    access.forEach(row => {
        console.log(`Email: ${row.email} | Has Access To: ${row.product_id}`);
    });
}

check().catch(console.error);
