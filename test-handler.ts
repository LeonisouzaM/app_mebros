import 'dotenv/config';
import handler from './api/products/index.js';

const mockReq = {
    method: 'POST',
    headers: {
        authorization: 'Bearer placeholder'
    },
    body: {
        name: 'Test Product',
        description: '',
        coverUrl: '',
        language: 'pt',
        supportNumber: '',
        hotmartId: '',
        banners: [],
        id: 'prod_test_12345'
    }
};

const mockRes = {
    status: (code) => {
        console.log(`STATUS: ${code}`);
        return mockRes;
    },
    json: (data) => {
        console.log(`JSON:`, data);
        return mockRes;
    }
};

// Override the requireAdmin function by modifying the source or using a stub
// Actually, it's easier to mock jwt.verify
import jwt from 'jsonwebtoken';
jwt.verify = () => ({ userId: '1', email: 'test@example.com', role: 'admin' });

async function run() {
    try {
        await handler(mockReq as any, mockRes as any);
        console.log("Handler finished");
    } catch (err) {
        console.error("Handler threw:", err);
    }
}

run();
