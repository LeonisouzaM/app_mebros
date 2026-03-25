import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function promote() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const email = 'leonisouza09@gmail.com';
        await sql`UPDATE users SET role = 'admin' WHERE LOWER(email) = LOWER(${email})`;
        console.log(`User ${email} promoted to admin!`);
    } catch (e) {
        console.error('Error:', e);
    }
}

promote();
