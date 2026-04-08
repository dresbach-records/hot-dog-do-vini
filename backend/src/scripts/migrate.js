import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __root = path.join(__dirname, '../../../');

// Load .env
dotenv.config({ path: path.join(__root, 'backend/.env') });

async function migrate() {
  console.log('🚀 Iniciando Migração do Banco de Dados Vini\'s...');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'hotdog_user',
    password: process.env.DB_PASSWORD || 'SenhaForte123!',
    multipleStatements: true
  });

  try {
    const schemaPath = path.join(__root, 'mysql_schema.sql');
    let schema = fs.readFileSync(schemaPath, 'utf8');

    // 1. Remove comentários de linha única do MySQL
    schema = schema.replace(/--.*$/gm, '');
    
    // 2. Trata os DELIMITERs
    // Remove as linhas de "DELIMITER //" e "DELIMITER ;"
    schema = schema.replace(/DELIMITER\s+\/\//g, '');
    schema = schema.replace(/DELIMITER\s+;/g, '');
    
    // 3. O schema consolidado usa "//" para encerrar triggers. 
    // Vamos substituir "//" por ";" para que o multipleStatements entenda como o fim da instrução.
    schema = schema.replace(/\/\//g, ';');

    console.log('📦 Processando e enviando queries...');
    
    // Agora que limpamos, podemos mandar o bloco todo de uma vez (graças ao multipleStatements: true)
    // Ou quebrar por ";" para ter mais controle de erro.
    const blocks = schema.split(';').map(b => b.trim()).filter(b => b.length > 0);
    
    for (const block of blocks) {
      try {
        await connection.query(block);
      } catch (err) {
        console.warn(`⚠️ Aviso em bloco: ${err.message}`);
        // Continua se for erro de "já existe", etc.
      }
    }

    console.log('✅ Migração finalizada!');
  } catch (err) {
    console.error('❌ Erro na migração:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();
