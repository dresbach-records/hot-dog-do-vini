-- Migração: Vini's Delivery - Infraestrutura Industrial Completa
-- Data: 12/04/2026
-- Objetivo: Criar tabelas para os módulos de Motoboys, Filiais, Marketing, Jurídico e Fiscal.

USE hotdog_db;

-- 1. Tabela de Motoboys (Gestão de Entregadores)
CREATE TABLE IF NOT EXISTS motoboys (
    id VARCHAR(100) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    veiculo VARCHAR(50),
    placa VARCHAR(20),
    disponivel BOOLEAN DEFAULT TRUE,
    total_entregas INT DEFAULT 0,
    ganho_dia DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Filiais (Gestão Multi-unidades)
CREATE TABLE IF NOT EXISTS filiais (
    id VARCHAR(100) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco VARCHAR(255),
    responsavel VARCHAR(100),
    meta DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Cupons (Marketing)
CREATE TABLE IF NOT EXISTS cupons (
    id VARCHAR(100) PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    desconto DECIMAL(10,2) NOT NULL,
    tipo ENUM('porcentagem', 'fixo') NOT NULL,
    limite INT DEFAULT 0,
    usados INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabela de Modelos de Contrato (Jurídico)
CREATE TABLE IF NOT EXISTS contratos_templates (
    id VARCHAR(100) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    conteudo TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Contratos Gerados (Jurídico)
CREATE TABLE IF NOT EXISTS contratos (
    id VARCHAR(100) PRIMARY KEY,
    template_id VARCHAR(100),
    nome_parte_B VARCHAR(255),
    documento_parte_B VARCHAR(50),
    status VARCHAR(20) DEFAULT 'rascunho',
    url_pdf VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES contratos_templates(id) ON DELETE SET NULL
);

-- 6. Tabela de Documentos Institucionais (Jurídico/RH)
CREATE TABLE IF NOT EXISTS documentos (
    id VARCHAR(100) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50),
    url VARCHAR(255) NOT NULL,
    data_vencimento DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabela de Registros Fiscais (Vendas Manuais / Auditoria)
CREATE TABLE IF NOT EXISTS fiscal_records (
    id VARCHAR(100) PRIMARY KEY,
    data_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
    descricao TEXT,
    forma_pagamento VARCHAR(50),
    valor_total DECIMAL(10,2) NOT NULL,
    nota_fiscal_vinculada VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabela de Configurações de Site/Sistema (Settings)
CREATE TABLE IF NOT EXISTS site_configs (
    `key` VARCHAR(100) PRIMARY KEY,
    `value` TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 9. Ajustes de Paridade iFood / Anota AI em Produtos e Categorias
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS ifood_id VARCHAR(100) NULL;
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS anotaai_id VARCHAR(100) NULL;

ALTER TABLE produtos ADD COLUMN IF NOT EXISTS ifood_id VARCHAR(100) NULL;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS anotaai_id VARCHAR(100) NULL;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS preco_original DECIMAL(10,2) NULL; -- Para de/por em marketing
