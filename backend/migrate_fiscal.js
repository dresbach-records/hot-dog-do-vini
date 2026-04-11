
import { query } from './src/config/database.js';

async function migrate() {
  console.log('--- Iniciando Migração Fiscal ---');

  try {
    // 1. Adicionar campos fiscais em produtos
    console.log('Atualizando tabela de produtos...');
    await query(`
      ALTER TABLE produtos 
      ADD COLUMN IF NOT EXISTS ncm VARCHAR(10) DEFAULT '2106.90.90',
      ADD COLUMN IF NOT EXISTS cfop VARCHAR(4) DEFAULT '5102',
      ADD COLUMN IF NOT EXISTS icms_origem INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS icms_situacao_tributaria VARCHAR(3) DEFAULT '102'
    `);

    // 2. Criar tabela de emissões fiscais
    console.log('Criando tabela pedido_emissao_fiscal...');
    await query(`
      CREATE TABLE IF NOT EXISTS pedido_emissao_fiscal (
        id VARCHAR(36) PRIMARY KEY,
        pedido_id VARCHAR(36) NOT NULL,
        ref VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(30) NOT NULL, -- autorizado, erro_autorizacao, cancelado
        chave_nfe VARCHAR(44),
        numero VARCHAR(10),
        serie VARCHAR(5),
        xml_url TEXT,
        danfe_url TEXT,
        mensagem_sefaz TEXT,
        created_at DATETIME NOT NULL,
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
      )
    `);

    console.log('--- Migração Concluída com Sucesso ---');
    process.exit(0);
  } catch (err) {
    console.error('Erro na migração:', err);
    process.exit(1);
  }
}

migrate();
