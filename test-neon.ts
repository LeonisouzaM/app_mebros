import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function test() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const banners = [];
        await sql`
            UPDATE products SET banners = ${banners} WHERE id = 'xyz'
        `;
        console.log("Empty array works on UPDATE without explicit cast!");
    } catch (e) {
        console.error("Empty array UPDATE error:", e.message);
    }
}
test();
