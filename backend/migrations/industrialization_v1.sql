
-- MIGRATION: INDUSTRIALIZAÇÃO V1 (ENTERPRISE)
-- Vini's Delivery ERP

-- 1. Tabela de Avaliações (NPS)
CREATE TABLE IF NOT EXISTS avaliacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  cliente_nome VARCHAR(255),
  comentario TEXT,
  nota_comida INT CHECK (nota_comida BETWEEN 1 AND 5),
  nota_entrega INT CHECK (nota_entrega BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Horários de Funcionamento (Grade Semanal)
CREATE TABLE IF NOT EXISTS horarios_funcionamento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dia_semana ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo') NOT NULL,
  aberto BOOLEAN DEFAULT TRUE,
  inicio TIME,
  fim TIME,
  UNIQUE(dia_semana)
);

-- 3. Tabela de Mesas (Gestão Presencial)
CREATE TABLE IF NOT EXISTS mesas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero VARCHAR(10) NOT NULL UNIQUE,
  status ENUM('livre', 'ocupada', 'reservada') DEFAULT 'livre',
  valor_atual DECIMAL(10,2) DEFAULT 0.00,
  inicio_sessao TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Tabela de Repasses Financeiros (Pagar.me / Industrial)
CREATE TABLE IF NOT EXISTS repasses_pagarme (
  id INT AUTO_INCREMENT PRIMARY KEY,
  data_origem DATE,
  data_estimada_pagamento DATE,
  valor_bruto DECIMAL(10,2),
  valor_liquido DECIMAL(10,2),
  taxas DECIMAL(10,2),
  status ENUM('agendado', 'pago', 'cancelado', 'em_processamento') DEFAULT 'agendado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Populando Horários Padrão (se vazia)
INSERT IGNORE INTO horarios_funcionamento (dia_semana, inicio, fim) VALUES 
('segunda', '18:00:00', '23:30:00'),
('terca', '18:00:00', '23:30:00'),
('quarta', '18:00:00', '23:30:00'),
('quinta', '18:00:00', '23:30:00'),
('sexta', '18:00:00', '01:00:00'),
('sabado', '18:00:00', '01:00:00'),
('domingo', '18:00:00', '23:30:00');

-- Populando Mesas Iniciais (se vazia)
INSERT IGNORE INTO mesas (numero) VALUES 
('001'), ('002'), ('003'), ('004'), ('005'), ('006'), ('007'), ('008'), ('009'), ('010');

-- 5. iFood Industrial: Configurações e Tokens (Multi-Merchant)
CREATE TABLE IF NOT EXISTS ifood_config (
  merchant_id VARCHAR(100) PRIMARY KEY,
  client_id VARCHAR(255) NOT NULL,
  client_secret VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at DATETIME,
  last_heartbeat DATETIME,
  status_operacional VARCHAR(50) DEFAULT 'AVAILABLE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. iFood Industrial: Auditoria de Eventos (Idempotência)
CREATE TABLE IF NOT EXISTS ifood_events_log (
  event_id VARCHAR(255) PRIMARY KEY,
  merchant_id VARCHAR(100) NOT NULL,
  order_id VARCHAR(100) NOT NULL,
  event_code VARCHAR(10) NOT NULL,
  payload_bruto JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order (order_id),
  INDEX idx_merchant (merchant_id)
);

-- 7. iFood Industrial: Plataforma de Negociação (Disputas)
CREATE TABLE IF NOT EXISTS ifood_negotiations (
  order_id VARCHAR(100) PRIMARY KEY,
  merchant_id VARCHAR(100) NOT NULL,
  negotiation_id VARCHAR(255),
  reason TEXT,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 8. iFood Industrial: Eventos Financeiros e Conciliação (V3)
CREATE TABLE IF NOT EXISTS ifood_financial_log (
  id VARCHAR(255) PRIMARY KEY,
  merchant_id VARCHAR(100) NOT NULL,
  order_id VARCHAR(100),
  event_type VARCHAR(100), -- CANCEL, SALE, COMMISSION, FEE
  event_date DATETIME,
  amount DECIMAL(10,2),
  status VARCHAR(50), -- PENDING, SETTLED
  period_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_period (period_id),
  INDEX idx_merchant_date (merchant_id, event_date)
);


