import { db } from './src/config/database.js';

async function migrate() {
  try {
    console.log('--- Migração de Logística ---');
    
    // 1. Adicionar motoboy_id aos pedidos
    try {
      await db.query('ALTER TABLE pedidos ADD COLUMN motoboy_id VARCHAR(36) NULL;');
      console.log('✔ Coluna motoboy_id adicionada.');
    } catch (e) {
      console.log('ℹ Coluna motoboy_id já existe ou erro ignorado.');
    }

    // 2. Garantir que status_entrega existe (opcional, mas bom pra filtros)
    try {
      await db.query('ALTER TABLE pedidos ADD COLUMN status_entrega VARCHAR(50) DEFAULT "aguardando_coleta";');
      console.log('✔ Coluna status_entrega adicionada.');
    } catch (e) {
      console.log('ℹ Coluna status_entrega já existe.');
    }

    console.log('✔ Migração concluída com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Falha na migração:', err);
    process.exit(1);
  }
}

migrate();
