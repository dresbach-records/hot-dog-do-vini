-- Migração: Vini's Delivery Industrial Updates
-- Data: 12/04/2026
-- Objetivo: Adicionar suporte a código de barras e pagamentos externos (Anota AI Parity)

USE hotdog_db;

-- 1. Suporte a Leitor de Código de Barras Híbrido
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS barcode VARCHAR(100) UNIQUE NULL AFTER titulo;

-- 2. Suporte a ID de Pagamento Externo (Pagar.me/Stone/Asaas)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS pagamento_externo_id VARCHAR(100) NULL AFTER forma_pagamento;

-- 3. Índice para busca rápida de iFood Sync
CREATE INDEX IF NOT EXISTS idx_pedidos_externo ON pedidos(pagamento_externo_id);
