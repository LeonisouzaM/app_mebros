import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function checkUser(email: string) {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const u = await sql`SELECT email, role FROM users WHERE email = ${email}`;
        console.log('User check result:', u);
    } catch (e) {
        console.error('Error:', e);
    }
}

checkUser('leonisouza09@gmail.com');
checkUser('admin@admin.com');
