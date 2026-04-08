import { db } from './src/config/database.js';

try {
  console.log('--- Testando Conexão MariaDB ---');
  const [rows] = await db.query('SHOW TABLES');
  console.log('Tabelas encontradas:');
  console.table(rows);
  console.log('\n🚀 Conexão bem-sucedida!');
  process.exit(0);
} catch (error) {
  console.error('❌ Erro na conexão:', error.message);
  process.exit(1);
}
