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

const data = {
  "pagaram": [
    { "nome": "Eduardo", "total_cliente": 134.95, "total_pago": 134.95, "saldo_devedor": 0 },
    { "nome": "Guilherme", "total_cliente": 2.00, "total_pago": 2.00, "saldo_devedor": 0, "status": "pago", "gorjeta": 2.00 },
    { "nome": "Diogo", "total_cliente": 0, "total_pago": 0, "saldo_devedor": 0, "status": "pago" },
    { "nome": "Guarda Pass", "total_cliente": 215.92, "total_pago": 215.92, "saldo_devedor": 0, "status": "pago" }
  ],
  "nao_pagaram": [
    { "nome": "Vivi do Corte", "total_cliente": 53.98, "total_pago": 0, "saldo_devedor": 53.98 },
    { "nome": "Jose Figuera", "total_cliente": 33.49, "total_pago": 0, "saldo_devedor": 33.49 },
    { "nome": "Patric Corte", "total_cliente": 26.99, "total_pago": 0, "saldo_devedor": 26.99 },
    { "nome": "Carol", "total_cliente": 24.99, "total_pago": 0, "saldo_devedor": 24.99 }
  ]
};

async function seed() {
  console.log('--- Iniciando Inserção Financeira (MySQL) ---');
  const conn = await mysql.createConnection(dbConfig);

  try {
    for (const c of [...data.pagaram, ...data.nao_pagaram]) {
      console.log(`Inserindo: ${c.nome}...`);
      
      await conn.query(
        `INSERT INTO clientes (id, nome, total_cliente, total_pago, saldo_devedor) 
         VALUES (?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE total_cliente = VALUES(total_cliente), total_pago = VALUES(total_pago), saldo_devedor = VALUES(saldo_devedor)`,
        [uuidv4(), c.nome, c.total_cliente || 0, c.total_pago || 0, c.saldo_devedor || 0]
      );
    }

    console.log('--- Sincronização Concluída! ---');
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await conn.end();
  }
}

seed();

