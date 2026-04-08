-- ========================================================
-- 🔥 VINI'S DELIVERY ERP - MYSQL/MARIADB CONSOLIDATED SCHEMA
-- ========================================================

CREATE DATABASE IF NOT EXISTS hotdog_db;
USE hotdog_db;

-- 1. TABELA DE USUÁRIOS (Substitui Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client', -- 'admin', 'client', 'employee'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS categorias (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    ordem INT DEFAULT 0,
    ifood_id VARCHAR(100),
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. TABELA DE PRODUTOS
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

-- 4. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS clientes (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) UNIQUE, -- Relacionamento com users(id)
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255),
    cpf VARCHAR(14),
    empresa VARCHAR(100),
    total_cliente DECIMAL(10, 2) DEFAULT 0.00,
    total_pago DECIMAL(10, 2) DEFAULT 0.00,
    saldo_devedor DECIMAL(10, 2) DEFAULT 0.00,
    limite_credito DECIMAL(10, 2) DEFAULT 0.00,
    vencimento INT,
    data_nascimento DATE,
    status_integracao VARCHAR(50) DEFAULT 'nenhuma',
    setor VARCHAR(100),
    convenio_status VARCHAR(50) DEFAULT 'nao_solicitado',
    convenio_empresa_id VARCHAR(36),
    convenio_termo_aceito BOOLEAN DEFAULT FALSE,
    convenio_termo_versao VARCHAR(20) DEFAULT '1.0',
    convenio_ip_registro VARCHAR(50),
    convenio_data_solicitacao TIMESTAMP,
    convenio_limite DECIMAL(10, 2) DEFAULT 0.00,
    convenio_saldo DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. TABELA DE EMPRESAS_CONVENIO
CREATE TABLE IF NOT EXISTS empresas_convenio (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    limite_padrao DECIMAL(10, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABELA DE PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
    id VARCHAR(36) PRIMARY KEY,
    cliente_id VARCHAR(36),
    user_id VARCHAR(36), -- Quem fez o pedido
    codigo_pedido_curto VARCHAR(20),
    plataforma VARCHAR(50) DEFAULT 'vinis',
    id_externo VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'pendente',
    tipo_entrega VARCHAR(50) DEFAULT 'balcao',
    endereco_entrega JSON,
    forma_pagamento VARCHAR(50),
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    taxa_entrega DECIMAL(10, 2) DEFAULT 0.00,
    agendado_para TIMESTAMP NULL,
    itens JSON NOT NULL,
    asaas_payment_id VARCHAR(255),
    motoboy_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 7. TABELA DE MOTOBOYS
CREATE TABLE IF NOT EXISTS motoboys (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    tipo VARCHAR(50) DEFAULT 'freelancer',
    status VARCHAR(50) DEFAULT 'disponivel',
    veiculo VARCHAR(50) DEFAULT 'Moto',
    placa VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABELA DE INSUMOS
CREATE TABLE IF NOT EXISTS insumos (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE,
    categoria VARCHAR(100),
    quantidade DECIMAL(10, 2) DEFAULT 0.00,
    minimo DECIMAL(10, 2) DEFAULT 0.00,
    unidade VARCHAR(20) DEFAULT 'UN',
    custo_unitario DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. FICHA TÉCNICA
CREATE TABLE IF NOT EXISTS ficha_tecnica (
    id VARCHAR(36) PRIMARY KEY,
    produto_id VARCHAR(36),
    insumo_id VARCHAR(36),
    quantidade_gasta DECIMAL(10, 2) NOT NULL,
    UNIQUE(produto_id, insumo_id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE,
    FOREIGN KEY (insumo_id) REFERENCES insumos(id) ON DELETE CASCADE
);

-- 10. CONFIGURACOES LOJA
CREATE TABLE IF NOT EXISTS configuracoes_loja (
    id VARCHAR(36) PRIMARY KEY,
    merchant_id VARCHAR(255),
    ifood_access_token TEXT,
    ifood_refresh_token TEXT,
    ifood_token_expires_at TIMESTAMP NULL,
    status_loja VARCHAR(50) DEFAULT 'fechada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 11. CUPONS
CREATE TABLE IF NOT EXISTS cupons (
    id VARCHAR(36) PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    tipo VARCHAR(20) DEFAULT 'fixo',
    valor DECIMAL(10, 2) NOT NULL,
    validade_fim TIMESTAMP NULL,
    minimo_pedido DECIMAL(10, 2) DEFAULT 0.00,
    dia_semana INT,
    uso_maximo INT DEFAULT 0,
    uso_atual INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. TRIGGERS (MARIADB/MYSQL)
-- Atualiza Fiado
DELIMITER //
CREATE TRIGGER trg_atualiza_fiado AFTER UPDATE ON pedidos
FOR EACH ROW
BEGIN
    IF NEW.status = 'entregue' AND OLD.status != 'entregue' AND NEW.forma_pagamento = 'fiado' AND NEW.cliente_id IS NOT NULL THEN
        UPDATE clientes 
        SET saldo_devedor = saldo_devedor + NEW.total,
            total_cliente = total_cliente + NEW.total
        WHERE id = NEW.cliente_id;
    END IF;
    
    IF NEW.status = 'cancelado' AND OLD.status = 'entregue' AND NEW.forma_pagamento = 'fiado' AND NEW.cliente_id IS NOT NULL THEN
        UPDATE clientes 
        SET saldo_devedor = saldo_devedor - NEW.total,
            total_cliente = total_cliente - NEW.total
        WHERE id = NEW.cliente_id;
    END IF;
END;
//
DELIMITER ;
