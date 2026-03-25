import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function listUsers() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const users = await sql`SELECT email, role FROM users`;
        console.log(JSON.stringify(users, null, 2));
    } catch (e) {
        console.error('Error fetching users:', e);
    }
}

listUsers();
