import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function checkUser(email: string) {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const u = await sql`SELECT email, role FROM users WHERE email = ${email}`;
        if (u.length > 0) {
            console.log(`Email: ${u[0].email} | Role: ${u[0].role}`);
        } else {
            console.log(`User ${email} NOT FOUND`);
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

checkUser('leonisouza09@gmail.com');
checkUser('admin@admin.com');
