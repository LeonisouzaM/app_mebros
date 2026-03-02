import { neon } from '@neondatabase/serverless';
import { writeFileSync } from 'fs';
const sql = neon('postgresql://neondb_owner:npg_JHmTX4Vty9LZ@ep-broad-snow-ai9dqkqn-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');
async function run() {
    const u = await sql`SELECT id, email, role FROM users WHERE email = 'certificacionsuporte@proton.me'`;
    const p = await sql`SELECT id, name, hotmart_id FROM products`;
    const a = await sql`SELECT product_id FROM product_access WHERE user_id = ${u[0].id}`;
    const out = JSON.stringify({ user: u[0], products: p, access: a }, null, 2);
    writeFileSync('diag-output.txt', out);
    console.log('DONE - check diag-output.txt');
}
run().catch(console.error);
