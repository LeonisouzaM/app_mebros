import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function listAdmins() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const users = await sql`SELECT email, role FROM users WHERE role = 'admin'`;
        console.log('Admins found:', users.length);
        users.forEach(u => console.log(`- ${u.email}`));
    } catch (e) {
        console.error('Error fetching admins:', e);
    }
}

listAdmins();
