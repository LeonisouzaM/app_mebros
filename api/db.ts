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
    CREATE TABLE IF NOT EXISTS product_access (
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id VARCHAR(255) NOT NULL,
      transaction_id VARCHAR(255),
      granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, product_id)
    );
  `;
}
