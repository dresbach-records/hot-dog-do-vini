import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __root = join(__dirname, '../../../');

dotenv.config({ path: join(__root, 'backend/.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'hotdog_user',
  password: process.env.DB_PASSWORD || 'SenhaForte123!',
  database: process.env.DB_DATABASE || 'hotdog_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper para queries simples
export const query = async (sql, params) => {
  const [results] = await pool.execute(sql, params);
  return results;
};

// Helper para transações (opcional mas recomendado)
export const getTransaction = async () => {
  return await pool.getConnection();
};

export default pool;
