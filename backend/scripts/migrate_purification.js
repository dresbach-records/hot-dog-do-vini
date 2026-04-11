import { db } from '../src/config/database.js';

async function migrate() {
  console.log('🚀 Iniciando Migração de Purificação (Remoção de Mocks)...');

  try {
    // 1. Tabela de Funcionários (RH)
    await db.query(`
      CREATE TABLE IF NOT EXISTS funcionarios (
        id VARCHAR(36) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cargo VARCHAR(100),
        salario DECIMAL(10, 2),
        data_admissao DATE,
        status ENUM('ativo', 'afastado', 'desligado') DEFAULT 'ativo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela [funcionarios] ok.');

    // 2. Tabela de Despesas (Financeiro)
    await db.query(`
      CREATE TABLE IF NOT EXISTS despesas (
        id VARCHAR(36) PRIMARY KEY,
        descricao VARCHAR(255) NOT NULL,
        valor DECIMAL(10, 2) NOT NULL,
        categoria VARCHAR(100),
        pago BOOLEAN DEFAULT FALSE,
        data_pagamento DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela [despesas] ok.');

    // 3. Tabela de Movimentações de Caixa (Fluxo de Caixa)
    await db.query(`
      CREATE TABLE IF NOT EXISTS caixa_movimentacoes (
        id VARCHAR(36) PRIMARY KEY,
        tipo ENUM('entrada', 'saida') NOT NULL,
        valor DECIMAL(10, 2) NOT NULL,
        origem VARCHAR(100),
        pedido_id VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela [caixa_movimentacoes] ok.');

    // 4. Tabela de Receitas / Fichas Técnicas (Baixa Automática)
    await db.query(`
      CREATE TABLE IF NOT EXISTS produto_insumos (
        id VARCHAR(36) PRIMARY KEY,
        produto_id VARCHAR(36) NOT NULL,
        insumo_id VARCHAR(36) NOT NULL,
        quantidade_necessaria DECIMAL(10, 3) NOT NULL,
        FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
        FOREIGN KEY (insumo_id) REFERENCES insumos(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabela [produto_insumos] ok.');

    console.log('\n✨ Migração concluída com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na migração:', err);
    process.exit(1);
  }
}

migrate();
