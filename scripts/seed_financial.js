import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hgfpuadujzousfpqvjbu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZnB1YWR1anpvdXNmcHF2amJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMjk5OTIsImV4cCI6MjA5MDgwNTk5Mn0.vKStJ7dBeCDGKpepzIgk31V8Tj8-Ip2aRujseHwGdpU";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const data = {
  "pagaram": [
    { "nome": "Eduardo", "total_cliente": 134.95, "total_pago": 134.95, "saldo_devedor": 0 },
    { "nome": "Guilherme", "total_cliente": 2.00, "total_pago": 2.00, "saldo_devedor": 0, "status": "pago", "gorjeta": 2.00 },
    { "nome": "Diogo", "total_cliente": 0, "total_pago": 0, "saldo_devedor": 0, "status": "pago" },
    { "nome": "Guarda Pass", "total_cliente": 215.92, "total_pago": 215.92, "saldo_devedor": 0, "status": "pago" }
  ],
  "nao_pagaram": [
    { "nome": "Vivi do Corte", "total_cliente": 53.98, "total_pago": 0, "saldo_devedor": 53.98 },
    { "nome": "Jose Figuera", "total_cliente": 33.49, "total_pago": 0, "saldo_devedor": 33.49 },
    { "nome": "Patric Corte", "total_cliente": 26.99, "total_pago": 0, "saldo_devedor": 26.99 },
    { "nome": "Carol", "total_cliente": 24.99, "total_pago": 0, "saldo_devedor": 24.99 }
  ]
};

async function seed() {
  console.log('--- Iniciando Inserção (Insert Direto) ---');

  for (const c of [...data.pagaram, ...data.nao_pagaram]) {
    console.log(`Inserindo: ${c.nome}...`);
    
    const { error } = await supabase
      .from('clientes')
      .insert({
        nome: c.nome,
        total_cliente: c.total_cliente || 0,
        total_pago: c.total_pago || 0,
        saldo_devedor: c.saldo_devedor || 0
      });

    if (error) {
      console.error(`Erro ao inserir ${c.nome}:`, error.message);
    }
  }

  console.log('--- Sincronização Concluída! ---');
}

seed();
