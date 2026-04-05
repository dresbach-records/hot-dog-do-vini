import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hgfpuadujzousfpqvjbu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZnB1YWR1anpvdXNmcHF2amJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMjk5OTIsImV4cCI6MjA5MDgwNTk5Mn0.vKStJ7dBeCDGKpepzIgk31V8Tj8-Ip2aRujseHwGdpU";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log('--- Verificando Tabelas no Supabase ---');
  
  const tables = ['categorias', 'produtos', 'pedidos', 'clientes'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.error(`❌ Erro na tabela [${table}]:`, error.message);
    } else {
      console.log(`✅ Tabela [${table}] acessível.`);
    }
  }
}

checkSchema();
