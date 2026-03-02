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
}
