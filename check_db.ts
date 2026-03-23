import { db } from './api/db';

async function check() {
    console.log("Checking DB...");
    try {
        const users = await db.selectFrom('users').selectAll().execute();
        console.log("Users count:", users.length);
        const products = await db.selectFrom('products').selectAll().execute();
        console.log("Products count:", products.length);
        const classes = await db.selectFrom('classes').selectAll().execute();
        console.log("Classes count:", classes.length);
    } catch (e) {
        console.error(e);
    }
}
check();
