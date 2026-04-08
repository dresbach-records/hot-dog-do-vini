import { query } from './src/infrastructure/database.js';

async function checkDB() {
  try {
    const tables = await query('SHOW TABLES');
    console.log('Tables:', JSON.stringify(tables, null, 2));

    const rows = await query('SELECT id, nome, saldo_devedor FROM clientes');
    console.log('Clients:', JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error checking DB:', error);
  }
}

checkDB();
