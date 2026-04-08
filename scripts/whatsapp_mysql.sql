-- ====== MÓDULO: WHATSAPP WEB + IA (MYSQL/MARIADB VERSION) ======
-- Vini's PRO - SaaS Edition

USE hotdog_db;

-- 1. TABELA: CONTATOS
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
    id VARCHAR(36) PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255),
    pushname VARCHAR(255),
    profile_pic_url TEXT,
    tags JSON, -- Armazenado como array JSON
    segmento VARCHAR(50) DEFAULT 'alimenticio',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. TABELA: CONVERSAS
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id VARCHAR(36) PRIMARY KEY,
    contact_id VARCHAR(36),
    account_id VARCHAR(36),
    status VARCHAR(50) DEFAULT 'bot', -- bot, aberto, aguardando, finalizado
    prioridade VARCHAR(20) DEFAULT 'normal',
    assigned_to VARCHAR(36),
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES whatsapp_contacts(id) ON DELETE CASCADE
);

-- 3. TABELA: MENSAGENS
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36),
    external_id VARCHAR(255) UNIQUE, 
    sender VARCHAR(20) NOT NULL, -- user, agent, ai
    direction VARCHAR(10) DEFAULT 'IN', -- IN / OUT
    content TEXT,
    type VARCHAR(50) DEFAULT 'chat',
    delivered BOOLEAN DEFAULT FALSE,
    `read` BOOLEAN DEFAULT FALSE, -- read is a reserved word in some SQL versions
    media_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES whatsapp_conversations(id) ON DELETE CASCADE
);

-- 4. TABELA: TICKETS (SLA E GESTÃO)
CREATE TABLE IF NOT EXISTS whatsapp_tickets (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36),
    status VARCHAR(20) DEFAULT 'open', -- open, pending, closed
    priority VARCHAR(10) DEFAULT 'medium', -- low, medium, high
    assigned_to VARCHAR(36),
    sla_deadline TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES whatsapp_conversations(id) ON DELETE CASCADE
);

-- 5. TABELA: LOGS DE IA
CREATE TABLE IF NOT EXISTS ai_logs (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36),
    input TEXT,
    output TEXT,
    model VARCHAR(50),
    tokens INTEGER,
    context JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES whatsapp_conversations(id) ON DELETE CASCADE
);
