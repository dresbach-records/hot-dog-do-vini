-- ========================================================
-- 🔥 VINI'S DELIVERY ERP - EXTRA TABLES (MARIADB PRODUCTION)
-- ========================================================

-- 1. TABELA DE CUPONS
CREATE TABLE IF NOT EXISTS cupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    tipo ENUM('percentual', 'fixo') NOT NULL DEFAULT 'percentual',
    valor DECIMAL(10,2) NOT NULL,
    valor_minimo DECIMAL(10,2) DEFAULT 0.00,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE MOTOBOYS
CREATE TABLE IF NOT EXISTS motoboys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    veiculo VARCHAR(50),
    placa VARCHAR(10),
    status ENUM('disponivel', 'em_entrega', 'offline') DEFAULT 'disponivel',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE DESPESAS (FINANCEIRO)
CREATE TABLE IF NOT EXISTS despesas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    categoria VARCHAR(100),
    valor DECIMAL(10,2) NOT NULL,
    vencimento DATE,
    pago BOOLEAN DEFAULT FALSE,
    data_pagamento TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABELA DE MOVIMENTAÇÕES DE CAIXA
CREATE TABLE IF NOT EXISTS caixa_movimentacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('entrada', 'saida') NOT NULL,
    descricao VARCHAR(255),
    valor DECIMAL(10,2) NOT NULL,
    metodo ENUM('dinheiro', 'pix', 'cartao') DEFAULT 'dinheiro',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DADOS DE TESTE (CUPONS)
INSERT IGNORE INTO cupons (codigo, tipo, valor, valor_minimo) VALUES ('VINI10', 'percentual', 10.00, 50.00);
INSERT IGNORE INTO cupons (codigo, tipo, valor, valor_minimo) VALUES ('BEMVINDO', 'fixo', 5.00, 20.00);
