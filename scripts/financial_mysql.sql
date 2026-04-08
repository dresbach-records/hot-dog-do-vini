-- ====== MÓDULO: FINANCEIRO / PAGAMENTOS (MYSQL/MARIADB) ======
USE hotdog_db;

-- 1. TABELA: LOG DE EVENTOS (ASAAS WEBHOOKS)
CREATE TABLE IF NOT EXISTS events_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSON,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA: PAGAMENTOS (ASAAS CORE)
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    asaas_id VARCHAR(255) UNIQUE NOT NULL,
    customer_id VARCHAR(255),
    subscription_id VARCHAR(255),
    billing_type VARCHAR(50),
    status VARCHAR(50),
    value DECIMAL(10, 2),
    net_value DECIMAL(10, 2),
    due_date DATE,
    payment_date DATETIME,
    description TEXT,
    bank_slip_url TEXT,
    invoice_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. TABELA: HISTÓRICO DE STATUS
CREATE TABLE IF NOT EXISTS payment_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(36),
    status VARCHAR(50),
    event_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- 4. TABELA: TRANSAÇÕES FINANCEIRAS (LEDGER)
CREATE TABLE IF NOT EXISTS financial_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(36),
    type ENUM('CREDIT', 'DEBIT') NOT NULL,
    category VARCHAR(50), -- PAYMENT, REFUND, CHARGEBACK, etc.
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);
