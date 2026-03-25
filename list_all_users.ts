import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function listAllUsers() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const users = await sql`SELECT email, role FROM users`;
        console.log('--- ALL USERS ---');
        users.forEach(u => console.log(`${u.email} | ${u.role}`));
        console.log('-----------------');
    } catch (e) {
        console.error('Error:', e);
    }
}

listAllUsers();
