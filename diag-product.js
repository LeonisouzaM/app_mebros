import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_JHmTX4Vty9LZ@ep-broad-snow-ai9dqkqn-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

const EMAIL = 'certificacionsuporte@proton.me';

async function diag() {
    console.log('\n========== DIAGNÓSTICO ==========\n');

    // 1. Verificar se o usuário existe
    const users = await sql`SELECT id, email, role FROM users WHERE email = ${EMAIL}`;
    if (users.length === 0) {
        console.log(`❌ USUÁRIO "${EMAIL}" NÃO EXISTE no banco!`);
        console.log('   → O webhook da Hotmart nunca chegou ou falhou ao criar esse usuário.');
    } else {
        console.log(`✅ Usuário encontrado: ${users[0].email} [role: ${users[0].role}] [id: ${users[0].id}]`);

        // 2. Verificar acessos do usuário
        const access = await sql`SELECT product_id FROM product_access WHERE user_id = ${users[0].id}`;
        if (access.length === 0) {
            console.log(`❌ Usuário NÃO TEM ACESSO a nenhum produto!`);
        } else {
            console.log(`\n📦 Produtos que o usuário tem acesso:`);
            access.forEach(a => console.log(`   - product_id: "${a.product_id}"`));
        }
    }

    // 3. Verificar todos os produtos cadastrados no sistema
    const products = await sql`SELECT id, name, hotmart_id FROM products`;
    console.log(`\n📋 Produtos cadastrados no sistema:`);
    if (products.length === 0) {
        console.log('   ❌ NENHUM produto cadastrado no banco!');
    } else {
        products.forEach(p => {
            console.log(`   - id: "${p.id}" | nome: "${p.name}" | hotmart_id: "${p.hotmart_id}"`);
        });
    }

    // 4. Verificar se existe produto com hotmart_id = 7305069
    const hotmartMatch = await sql`SELECT id, name FROM products WHERE hotmart_id = '7305069'`;
    console.log(`\n🔍 Produto com hotmart_id = "7305069":`);
    if (hotmartMatch.length === 0) {
        console.log('   ❌ Nenhum produto encontrado com esse hotmart_id!');
    } else {
        console.log(`   ✅ Encontrado: id="${hotmartMatch[0].id}" | nome="${hotmartMatch[0].name}"`);
    }

    console.log('\n=================================\n');
}

diag().catch(console.error);
