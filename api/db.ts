import { neon } from '@neondatabase/serverless';

export const sql = (strings: TemplateStringsArray, ...values: any[]) => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing in Vercel environment variables');
  }
  const db = neon(process.env.DATABASE_URL);
  return db(strings, ...values);
};


// Function to initialize tables
export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      role VARCHAR(50) DEFAULT 'student',
      name VARCHAR(255),
      photo VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      cover_url TEXT,
      language VARCHAR(10) DEFAULT 'pt',
      support_number VARCHAR(50),
      hotmart_id VARCHAR(100),
      banners TEXT[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS classes (
      id VARCHAR(255) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      cloudinary_url TEXT NOT NULL,
      cover_url TEXT,
      description TEXT,
      button_text VARCHAR(255),
      product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
      unlock_date TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS feed_posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image_url TEXT,
      product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await sql`ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS image_url TEXT`;
    await sql`ALTER TABLE classes ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'link'`;
    await sql`ALTER TABLE classes ADD COLUMN IF NOT EXISTS attachment_url TEXT`;
  } catch (e) {
    console.log('Columns handled');
  }

  await sql`
    CREATE TABLE IF NOT EXISTS comments (
      id SERIAL PRIMARY KEY,
      user_name VARCHAR(255) NOT NULL,
      user_photo TEXT,
      user_email VARCHAR(255),
      text TEXT NOT NULL,
      image_url TEXT,
      product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
      parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
      likes_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS comment_likes (
      id SERIAL PRIMARY KEY,
      comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
      user_email VARCHAR(255) NOT NULL,
      UNIQUE(comment_id, user_email)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS system_banners (
      id SERIAL PRIMARY KEY,
      url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS product_access (
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id VARCHAR(255) NOT NULL,
      transaction_id VARCHAR(255),
      granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, product_id)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      user_email VARCHAR(255) NOT NULL,
      endpoint TEXT NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}
