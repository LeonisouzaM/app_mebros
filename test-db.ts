import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
import fs from 'fs';

const sql = neon(process.env.DATABASE_URL!);

async function checkDB() {
    try {
        const users = await sql`SELECT * FROM users ORDER BY created_at DESC LIMIT 5`;
        const access = await sql`SELECT * FROM product_access ORDER BY granted_at DESC LIMIT 5`;
        fs.writeFileSync('db-output.json', JSON.stringify({users, access}, null, 2));
    } catch (e: any) {
        console.error('Error:', e.message);
    }
}
checkDB();
