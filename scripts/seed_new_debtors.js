import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../backend/.env') });

const dbConfig = {
  host: process.env.DB_HOST || '187.127.17.241',
  user: process.env.DB_USERNAME || 'hotdog_user',
  password: process.env.DB_PASSWORD || 'SenhaForte123!',
  database: process.env.DB_DATABASE || 'hotdog_db'
};

const data = [
  { "nome": "Wslwy", "total_cliente": 15.00, "total_pago": 0, "saldo_devedor": 15.00, "telefone": "7 de Abril" },
  { "nome": "Davi", "total_cliente": 26.99, "total_pago": 0, "saldo_devedor": 26.99, "telefone": "7 de Abril" }
];

async function seed() {
  console.log('--- Inserindo Wslwy e Davi (MySQL) ---');
  const conn = await mysql.createConnection(dbConfig);

  try {
    for (const c of data) {
      console.log(`Inserindo: ${c.nome}...`);
      
      await conn.query(
        `INSERT INTO clientes (id, nome, total_cliente, total_pago, saldo_devedor, telefone) 
         VALUES (?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE total_cliente = VALUES(total_cliente), total_pago = VALUES(total_pago), saldo_devedor = VALUES(saldo_devedor), telefone = VALUES(telefone)`,
        [uuidv4(), c.nome, c.total_cliente, c.total_pago, c.saldo_devedor, c.telefone]
      );
    }

    console.log('--- Concluído! ---');
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await conn.end();
  }
}

seed();

