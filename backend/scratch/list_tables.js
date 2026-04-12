import { db } from '../src/config/database.js';

async function list() {
  try {
    const [rows] = await db.query('SHOW TABLES');
    console.log('--- Tabelas no Banco: ---');
    rows.forEach(row => {
      console.log(Object.values(row)[0]);
    });
    process.exit(0);
  } catch (err) {
    console.error('Erro:', err.message);
    process.exit(1);
  }
}

list();
