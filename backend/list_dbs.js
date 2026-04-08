import { query } from './src/infrastructure/database.js';

async function listDatabases() {
  try {
    const dbs = await query('SHOW DATABASES');
    console.log('Databases:', JSON.stringify(dbs, null, 2));
  } catch (error) {
    console.error('Error listing DBs:', error);
  }
}

listDatabases();
