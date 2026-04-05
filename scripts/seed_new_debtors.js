import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hgfpuadujzousfpqvjbu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZnB1YWR1anpvdXNmcHF2amJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMjk5OTIsImV4cCI6MjA5MDgwNTk5Mn0.vKStJ7dBeCDGKpepzIgk31V8Tj8-Ip2aRujseHwGdpU";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const data = [
  { "nome": "Wslwy", "total_cliente": 15.00, "total_pago": 0, "saldo_devedor": 15.00, "telefone": "7 de Abril" },
  { "nome": "Davi", "total_cliente": 26.99, "total_pago": 0, "saldo_devedor": 26.99, "telefone": "7 de Abril" }
];

async function seed() {
  console.log('--- Inserindo Wslwy e Davi ---');

  for (const c of data) {
    console.log(`Inserindo: ${c.nome}...`);
    
    // Usando insert simples para evitar erros de constraint dependendo do schema atual
    const { error } = await supabase
      .from('clientes')
      .insert({
        nome: c.nome,
        total_cliente: c.total_cliente,
        total_pago: c.total_pago,
        saldo_devedor: c.saldo_devedor,
        telefone: c.telefone // Usando o campo telefone para guardar a data como solicitado ("dia 7 de abril")
      });

    if (error) {
      console.error(`Erro ao inserir ${c.nome}:`, error.message);
    }
  }

  console.log('--- Concluído! ---');
}

seed();
