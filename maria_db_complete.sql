-- ========================================================
-- 🔥 VINI'S DELIVERY ERP & SAAS - COMPLETE MARIADB/MYSQL SCHEMA
-- ========================================================

CREATE DATABASE IF NOT EXISTS hotdog_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hotdog_db;

-- ==========================================
-- 1. MÓDULO: SEGURANÇA E USUÁRIOS
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client', -- admin, client, employee, manager
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Perfil estendido para funcionários de empresas (SaaS)
CREATE TABLE IF NOT EXISTS usuarios_saas (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    telefone VARCHAR(20),
    cargo VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==========================================
-- 2. MÓDULO: CARDÁPIO (ERP)
-- ==========================================

CREATE TABLE IF NOT EXISTS categorias (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ordem INT DEFAULT 0,
    ifood_id VARCHAR(100),
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS produtos (
    id VARCHAR(36) PRIMARY KEY,
    categoria_id VARCHAR(36),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    imagem_url TEXT,
    disponivel BOOLEAN DEFAULT TRUE,
    ifood_id VARCHAR(100),
    destaque BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

-- ==========================================
-- 3. MÓDULO: CLIENTES E CONVÊNIOS (SaaS)
-- ==========================================

CREATE TABLE IF NOT EXISTS empresas (
    id VARCHAR(36) PRIMARY KEY,
    nome_fantasia VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255),
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    email_contato VARCHAR(255),
    limite_padrao_colaborador DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'ativo', -- ativo, inativo, inadimplente
    cor_primaria VARCHAR(7) DEFAULT '#EA1D2C', 
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientes (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    cpf VARCHAR(14),
    empresa_id VARCHAR(36), -- Se vinculado a uma empresa do SaaS
    total_cliente DECIMAL(10, 2) DEFAULT 0.00,
    total_pago DECIMAL(10, 2) DEFAULT 0.00,
    saldo_devedor DECIMAL(10, 2) DEFAULT 0.00,
    limite_credito DECIMAL(10, 2) DEFAULT 0.00,
    vencimento INT DEFAULT 5,
    status_integracao VARCHAR(50) DEFAULT 'nenhuma',
    convenio_status VARCHAR(50) DEFAULT 'nao_solicitado',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS transacoes (
    id VARCHAR(36) PRIMARY KEY,
    cliente_id VARCHAR(36),
    pedido_id VARCHAR(36),
    tipo VARCHAR(20), -- debito, credito
    valor DECIMAL(10, 2) NOT NULL,
    saldo_anterior DECIMAL(10, 2),
    saldo_posterior DECIMAL(10, 2),
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- ==========================================
-- 4. MÓDULO: PEDIDOS E LOGÍSTICA
-- ==========================================

CREATE TABLE IF NOT EXISTS pedidos (
    id VARCHAR(36) PRIMARY KEY,
    cliente_id VARCHAR(36),
    user_id VARCHAR(36),
    codigo_pedido_curto VARCHAR(20),
    plataforma VARCHAR(50) DEFAULT 'vinis',
    status VARCHAR(50) DEFAULT 'pendente',
    tipo_entrega VARCHAR(50) DEFAULT 'balcao',
    endereco_entrega JSON,
    forma_pagamento VARCHAR(50), -- convenio, pix, cartao, dinheiro, fiado
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    taxa_entrega DECIMAL(10, 2) DEFAULT 0.00,
    itens JSON NOT NULL,
    motoboy_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS motoboys (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'disponivel',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. MÓDULO: ESTOQUE E OPERACIONAL
-- ==========================================

CREATE TABLE IF NOT EXISTS insumos (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    quantidade DECIMAL(10, 2) DEFAULT 0.00,
    unidade VARCHAR(20) DEFAULT 'UN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS configuracoes_loja (
    id VARCHAR(36) PRIMARY KEY,
    status_loja VARCHAR(50) DEFAULT 'fechada',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. TRIGGERS (AUTOMAÇÃO)
-- ==========================================

DELIMITER //

-- Gatilho para atualizar saldo devedor (ERP Fiado)
CREATE TRIGGER trg_atualiza_fiado AFTER UPDATE ON pedidos
FOR EACH ROW
BEGIN
    IF NEW.status = 'entregue' AND OLD.status != 'entregue' AND NEW.forma_pagamento = 'fiado' AND NEW.cliente_id IS NOT NULL THEN
        UPDATE clientes 
        SET saldo_devedor = saldo_devedor + NEW.total,
            total_cliente = total_cliente + NEW.total
        WHERE id = NEW.cliente_id;
        
        INSERT INTO transacoes (id, cliente_id, pedido_id, tipo, valor, descricao)
        VALUES (UUID(), NEW.cliente_id, NEW.id, 'debito', NEW.total, 'Compra Fiado');
    END IF;
END;
//

DELIMITER ;

-- ==========================================
-- 7. DADOS DE SEED (INICIALIZAÇÃO)
-- ==========================================

-- Categorias e Produtos
INSERT IGNORE INTO categorias (id, nome, ordem) VALUES ('cat-lanches', 'Lanches', 1);
INSERT IGNORE INTO produtos (id, categoria_id, titulo, preco) VALUES ('prod-hotdog', 'cat-lanches', 'Hotdog Especial', 25.90);

-- Clientes e Dívidas (Solicitado pelo usuário)
INSERT IGNORE INTO clientes (id, nome, empresa_id, saldo_devedor, status_integracao) VALUES 
('cli-jose', 'Jose Figueroa', NULL, 140.00, 'calote financeiro'),
('cli-vive', 'Vive Diva', NULL, 26.99, 'nenhuma'),
('cli-davi', 'Davi', NULL, 0.00, 'nenhuma');
