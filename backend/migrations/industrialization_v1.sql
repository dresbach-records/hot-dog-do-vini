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
