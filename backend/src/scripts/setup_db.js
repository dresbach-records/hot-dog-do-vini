import fs from 'fs';
import pool from '../infrastructure/database.js';

async function setupDatabase() {
  console.log('🚀 Iniciando configuração completa do banco de dados...');
  const sql = fs.readFileSync('../maria_db_complete.sql', 'utf8');

  try {
    // Usamos pool.query para scripts com múltiplas declarações
    await pool.query(sql);
    console.log('✅ Banco de dados configurado com sucesso!');
    
    // Verificar tabelas
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tabelas atuais no banco:');
    console.table(tables);
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
  } finally {
    process.exit(0);
  }
}

setupDatabase();
