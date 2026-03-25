import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function testInsert() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const id = 'test_prod_' + Date.now();
        const name = 'Test Product';
        const description = 'Test Description';
        const cover_url = 'https://example.com/cover.jpg';
        const language = 'pt';
        const support_number = '12345';
        const hotmart_id = 'H12345';
        const banners = ['https://example.com/banner1.jpg'];

        await sql`
            INSERT INTO products (id, name, description, cover_url, language, support_number, hotmart_id, banners)
            VALUES (${id}, ${name}, ${description}, ${cover_url}, ${language}, ${support_number}, ${hotmart_id}, ${banners})
        `;
        console.log('Insert successful with ID:', id);

        const check = await sql`SELECT * FROM products WHERE id = ${id}`;
        console.log('Check result:', check);
    } catch (e) {
        console.error('Insert error:', e);
    }
}

testInsert();
