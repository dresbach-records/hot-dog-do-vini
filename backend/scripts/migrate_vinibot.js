import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function migrateBot() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🚀 Iniciando Migração ViniBot PRO V3 (Recriação de Tabelas)...');

    // 1. Limpar e Recriar
    await client.query(`
      DROP TABLE IF EXISTS public.bot_interactions CASCADE;
      DROP TABLE IF EXISTS public.bot_config CASCADE;
    `);

    // 2. CONFIGURAÇÃO DO BOT (Anota AI Style)
    await client.query(`
      CREATE TABLE public.bot_config (
          id SERIAL PRIMARY KEY,
          saudacao TEXT DEFAULT 'Olá {cliente}! Sou o Vini Bot 🌭. Clique no link para ver nosso cardápio: {link_cardapio}',
          msg_confirmacao TEXT DEFAULT 'Pedido {pedido_id} recebido com sucesso! 🔥',
          msg_entrega TEXT DEFAULT 'Seu pedido {pedido_id} saiu para entrega! 🛵💨',
          msg_fechado TEXT DEFAULT 'No momento estamos fechados. Mas veja nosso cardápio: {link_cardapio}',
          link_cardapio TEXT DEFAULT 'https://hotdogdovini.com.br/cardapio',
          status_bot VARCHAR(50) DEFAULT 'ativo',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Inserir o ID 1
      INSERT INTO public.bot_config (id) VALUES (1);
    `);

    // 3. INTERAÇÕES E LOGS
    await client.query(`
      CREATE TABLE public.bot_interactions (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          whatsapp_from VARCHAR(50),
          message_received TEXT,
          bot_response TEXT,
          status VARCHAR(50), -- RECEIVED, REPLIED, ERROR
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Migração ViniBot PRO V3 Concluída com Sucesso!');
  } catch (err) {
    console.error('❌ Erro na migração ViniBot V3:', err);
  } finally {
    await client.end();
  }
}

migrateBot();
