-- MIGRATION: IFOOD INDUSTRIALIZATION V3 (ENTERPRISE)
-- Foco: Persistência de Tokens, Auditoria de Eventos e Gestão de Disputas

-- 1. Configurações da Integração iFood
CREATE TABLE IF NOT EXISTS ifood_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    merchant_id VARCHAR(100) NOT NULL UNIQUE,
    client_id VARCHAR(255) NOT NULL,
    client_secret TEXT NOT NULL,
    authorization_code_verifier TEXT NULL,
    access_token LONGTEXT NULL,
    refresh_token VARCHAR(255) NULL,
    token_expires_at DATETIME NULL,
    status_loja ENUM('AVAILABLE', 'UNAVAILABLE', 'CLOSED') DEFAULT 'UNAVAILABLE',
    is_interrupt BOOLEAN DEFAULT FALSE,
    polling_active BOOLEAN DEFAULT TRUE,
    last_heartbeat DATETIME NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Log de Eventos (Auditoria de Polling e Lifecycle)
CREATE TABLE IF NOT EXISTS ifood_events_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(100) NOT NULL UNIQUE,
    order_id VARCHAR(100) NOT NULL,
    merchant_id VARCHAR(100) NOT NULL,
    event_code VARCHAR(10) NOT NULL, -- PLC, CFM, RTP, etc
    full_code VARCHAR(100) NOT NULL, -- PLACED, CONFIRMED, etc
    sales_channel VARCHAR(50),
    payload JSON,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (order_id),
    INDEX (event_code)
);

-- 3. Gestão de Negociações (Handshake Platform)
CREATE TABLE IF NOT EXISTS ifood_negotiations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dispute_id VARCHAR(100) NOT NULL UNIQUE,
    order_id VARCHAR(100) NOT NULL,
    action ENUM('CANCELLATION', 'PARTIAL_CANCELLATION', 'PROPOSED_AMOUNT_REFUND', 'ADDITIONAL_TIME') NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'PROPOSED') DEFAULT 'PENDING',
    handshake_type VARCHAR(50),
    message TEXT,
    expires_at DATETIME NOT NULL,
    timeout_action VARCHAR(50),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Inserção de Configuração Inicial (Exemplo)
-- Substitua pelos dados reais na primeira execução ou via Dashboard
-- INSERT IGNORE INTO ifood_config (merchant_id, client_id, client_secret) VALUES ('SEU_MERCHANT_ID', 'SEU_CLIENT_ID', 'SEU_CLIENT_SECRET');
