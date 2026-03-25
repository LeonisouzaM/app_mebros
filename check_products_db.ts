import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function checkProducts() {
    const sql = neon(process.env.DATABASE_URL);
    try {
        const products = await sql`SELECT * FROM products`;
        console.log('Products found:', products);
    } catch (e) {
        console.error('Error fetching products:', e);
    }
}

checkProducts();
