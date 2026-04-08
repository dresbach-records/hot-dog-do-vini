import { query } from './src/infrastructure/database.js';

async function checkClients() {
  try {
    const rows = await query('SELECT id, nome, saldo_devedor FROM clientes');
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error fetching clients:', error);
  }
}

checkClients();
