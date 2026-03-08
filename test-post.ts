import 'dotenv/config';
import handler from './api/products/index.ts';

async function test() {
    const req = {
        method: 'POST',
        headers: {
            authorization: 'Bearer ' // Mock or we can just bypass auth internally
        },
        body: {
            name: "Teste",
            description: "",
            coverUrl: "",
            language: "pt",
            banners: [],
            supportNumber: "",
            hotmartId: "",
            id: "prod_123456"
        }
    };

    // We can't really mock VercelRequest fully easily, maybe just fetch:
}

test();
