import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_JHmTX4Vty9LZ@ep-broad-snow-ai9dqkqn-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

async function run() {
    console.log('Migrating comments table...');
    try {
        await sql`ALTER TABLE comments ADD COLUMN IF NOT EXISTS user_email VARCHAR(255)`;
        await sql`ALTER TABLE comments ADD COLUMN IF NOT EXISTS image_url TEXT`;
        await sql`ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE`;
        await sql`ALTER TABLE comments ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0`;

        await sql`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        user_email VARCHAR(255) NOT NULL,
        UNIQUE(comment_id, user_email)
      )
    `;
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

run();
