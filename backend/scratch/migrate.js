import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
};

async function migrate() {
    const connection = await mysql.createConnection(config);
    console.log('📦 Conectado ao banco de dados:', config.host);

    const sqlPath = 'f:/VINIS/backend/migrations/industrialization_ifood_v3.sql';
    const sql = fs.readFileSync(sqlPath, 'utf8');

    try {
        console.log('🚀 Executando migração: industrialization_ifood_v3.sql');
        await connection.query(sql);
        console.log('✅ Migração concluída com sucesso!');
    } catch (error) {
        console.error('❌ Erro na migração:', error.message);
    } finally {
        await connection.end();
    }
}

migrate();
