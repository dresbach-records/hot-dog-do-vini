import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __root = join(__dirname, '../../../');

dotenv.config({ path: join(__root, 'backend/.env') });

// Conexão profissional com Pool
export const db = await mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'hotdog_user',
  password: process.env.DB_PASSWORD || 'SenhaForte123!',
  database: process.env.DB_DATABASE || 'hotdog_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

// Helper para manter compatibilidade com refatorações anteriores
export const query = async (sql, params) => {
  const [results] = await db.execute(sql, params);
  return results;
};

export default db;
