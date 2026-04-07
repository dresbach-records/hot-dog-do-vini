import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function migratePro() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🚀 Iniciando Migração ERP Financeiro PRO (User Specification)...');

    // Limpeza opcional de tabelas piloto
    console.log('🧹 Removendo tabelas piloto anteriores...');
    await client.query(`
      DROP TABLE IF EXISTS public.asaas_invoices CASCADE;
      DROP TABLE IF EXISTS public.asaas_subscriptions CASCADE;
      DROP TABLE IF EXISTS public.asaas_wallet_events CASCADE;
      DROP TABLE IF EXISTS public.asaas_payments CASCADE;
      DROP TABLE IF EXISTS public.asaas_events CASCADE;
    `);

    // 1. LOG DE EVENTOS (Idempotência e Auditoria)
    console.log('🔹 Criando events_log...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.events_log (
          id SERIAL PRIMARY KEY,
          event_id VARCHAR(100) UNIQUE, 
          event_type VARCHAR(100) NOT NULL,
          payload JSONB NOT NULL,
          processed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_events_type ON public.events_log(event_type);
    `);

    // 2. PAGAMENTOS (Core)
    console.log('🔹 Criando payments...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.payments (
          id SERIAL PRIMARY KEY,
          asaas_id VARCHAR(50) UNIQUE NOT NULL,
          customer_id VARCHAR(50),
          subscription_id VARCHAR(50),
          billing_type VARCHAR(20), 
          status VARCHAR(30) NOT NULL,
          value NUMERIC(10,2) NOT NULL,
          net_value NUMERIC(10,2),
          due_date DATE,
          payment_date TIMESTAMP WITH TIME ZONE,
          description TEXT,
          invoice_url TEXT,
          bank_slip_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
      CREATE INDEX IF NOT EXISTS idx_payments_customer ON public.payments(customer_id);
    `);

    // 3. HISTÓRICO DE STATUS
    console.log('🔹 Criando payment_status_history...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.payment_status_history (
          id SERIAL PRIMARY KEY,
          payment_id INTEGER REFERENCES public.payments(id) ON DELETE CASCADE,
          status VARCHAR(30),
          event_type VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. TRANSAÇÕES (Ledger Financeiro)
    console.log('🔹 Criando financial_transactions...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.financial_transactions (
          id SERIAL PRIMARY KEY,
          payment_id INTEGER REFERENCES public.payments(id) ON DELETE SET NULL,
          type VARCHAR(20), 
          category VARCHAR(50), 
          amount NUMERIC(10,2) NOT NULL,
          balance_after NUMERIC(10,2),
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_transactions_payment ON public.financial_transactions(payment_id);
    `);

    // 5-9. OUTROS MÓDULOS (Invoices, Subscriptions, Transfers, Bills, Anticipations)
    console.log('🔹 Criando módulos complementares (Invoices, Transfers, etc)...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.invoices (
          id SERIAL PRIMARY KEY,
          asaas_id VARCHAR(50) UNIQUE NOT NULL,
          payment_id INTEGER REFERENCES public.payments(id) ON DELETE SET NULL,
          status VARCHAR(30),
          invoice_number VARCHAR(50),
          issued_at TIMESTAMP WITH TIME ZONE,
          canceled_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS public.subscriptions (
          id SERIAL PRIMARY KEY,
          asaas_id VARCHAR(50) UNIQUE NOT NULL,
          customer_id VARCHAR(50),
          status VARCHAR(30),
          value NUMERIC(10,2),
          billing_type VARCHAR(20),
          next_due_date DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS public.transfers (
          id SERIAL PRIMARY KEY,
          asaas_id VARCHAR(50) UNIQUE NOT NULL,
          amount NUMERIC(10,2),
          status VARCHAR(30),
          bank_account VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS public.bills (
          id SERIAL PRIMARY KEY,
          asaas_id VARCHAR(50) UNIQUE NOT NULL,
          amount NUMERIC(10,2),
          status VARCHAR(30),
          due_date DATE,
          payment_date TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS public.anticipations (
          id SERIAL PRIMARY KEY,
          asaas_id VARCHAR(50) UNIQUE NOT NULL,
          amount NUMERIC(10,2),
          status VARCHAR(30),
          requested_at TIMESTAMP WITH TIME ZONE,
          credited_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10-13. UTILITÁRIOS (Pix, KYC, Tokens, Blocks)
    console.log('🔹 Criando utilitários (Pix, KYC, API)...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.pix_recurring (
          id SERIAL PRIMARY KEY,
          asaas_id VARCHAR(50) UNIQUE NOT NULL,
          status VARCHAR(30),
          customer_id VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS public.account_status (
          id SERIAL PRIMARY KEY,
          status VARCHAR(50),
          type VARCHAR(50), 
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS public.api_tokens (
          id SERIAL PRIMARY KEY,
          token_name VARCHAR(100),
          status VARCHAR(30),
          expires_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS public.balance_blocks (
          id SERIAL PRIMARY KEY,
          amount NUMERIC(10,2),
          reason TEXT,
          blocked BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Migração PRO Concluída com Sucesso!');
  } catch (err) {
    console.error('❌ Erro na migração PRO:', err);
  } finally {
    await client.end();
  }
}

migratePro();
