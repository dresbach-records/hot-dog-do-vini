import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Forçar aceitação de certs auto-assinados (Supabase/AWS)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function migrate() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:54322/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🚀 Iniciando Migração ERP Financeiro V3...');

    // 1. Log de Eventos (Raw Webhook) - Module 14/Logs
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.asaas_events (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        event_type VARCHAR(100),
        payload JSONB,
        processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tabela de Cobranças (State Machine) - Module 1
    await client.query(`
       CREATE TABLE IF NOT EXISTS public.asaas_payments (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          asaas_payment_id VARCHAR(255) UNIQUE,
          cliente_id UUID REFERENCES public.clientes(id),
          status VARCHAR(100), -- PENDING, RECEIVED, OVERDUE, CHARGEBACK, etc
          valor NUMERIC(10, 2),
          forma_pagamento VARCHAR(50),
          data_vencimento DATE,
          data_pagamento TIMESTAMP WITH TIME ZONE,
          bank_slip_viewed BOOLEAN DEFAULT FALSE,
          checkout_viewed BOOLEAN DEFAULT FALSE,
          chargeback_status VARCHAR(50), -- REQUESTED, DISPUTE
          dunning_status VARCHAR(50), -- REQUESTED, RECEIVED
          timeline JSONB DEFAULT '[]', -- Histórico de mudanças [Module 13 Ledger-ish]
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
       );
    `);

    // 3. Notas Fiscais (Module 2) 
    await client.query(`
       CREATE TABLE IF NOT EXISTS public.asaas_invoices (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          asaas_invoice_id VARCHAR(255) UNIQUE,
          payment_id UUID REFERENCES public.asaas_payments(id),
          status VARCHAR(100), -- AUTHORIZED, ERROR, CANCELLED
          numero VARCHAR(100),
          link_pdf TEXT,
          xml_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
       );
    `);

    // 4. Assinaturas (Module 7)
    await client.query(`
       CREATE TABLE IF NOT EXISTS public.asaas_subscriptions (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          asaas_sub_id VARCHAR(255) UNIQUE,
          cliente_id UUID REFERENCES public.clientes(id),
          status VARCHAR(100), -- ACTIVE, INACTIVE, OVERDUE
          valor NUMERIC(10, 2),
          periodicidade VARCHAR(50), -- WEEKLY, MONTHLY, etc
          proximo_vencimento DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
       );
    `);

    // 5. Transferências e Antecipações (Module 3 & 5)
    await client.query(`
       CREATE TABLE IF NOT EXISTS public.asaas_wallet_events (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          tipo VARCHAR(50), -- TRANSFER, ANTICIPATION, BILL_PAYMENT
          asaas_id VARCHAR(255) UNIQUE,
          valor NUMERIC(10, 2),
          status VARCHAR(100), -- PENDING, BANK_PROCESSING, DONE, FAILED
          motivo TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
       );
    `);

    console.log('✅ Migração Concluída com Sucesso!');
  } catch (err) {
    console.error('❌ Erro na migração:', err);
  } finally {
    await client.end();
  }
}

migrate();
