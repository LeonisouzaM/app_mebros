import 'dotenv/config';
import fetch from 'node-fetch'; // if we want a full request, but we can just use the script.

import { sql, initDb } from './api/db.ts';

async function test() {
    try {
        await initDb();
        console.log('Db initialized');

        const productId = 'prod_test_' + Date.now();
        const existing = await sql`SELECT id FROM products WHERE id = ${productId}`;
        const isNewProduct = existing.length === 0;

        const res = await sql`
            INSERT INTO products (id, name, description, cover_url, language, support_number, hotmart_id, banners)
            VALUES (${productId}, 'Teste Novo', null, null, 'pt', null, null, ${[]})
            ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    cover_url = EXCLUDED.cover_url,
                    language = EXCLUDED.language,
                    support_number = EXCLUDED.support_number,
                    hotmart_id = EXCLUDED.hotmart_id,
                    banners = EXCLUDED.banners
        `;
        console.log('Insert success', isNewProduct);
        process.exit(0);
    } catch (err) {
        console.error('Insert error', err);
        process.exit(1);
    }
}

test();
