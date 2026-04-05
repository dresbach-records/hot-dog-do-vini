import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://hgfpuadujzousfpqvjbu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZnB1YWR1anpvdXNmcHF2amJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMjk5OTIsImV4cCI6MjA5MDgwNTk5Mn0.vKStJ7dBeCDGKpepzIgk31V8Tj8-Ip2aRujseHwGdpU";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const clientesData = [
  { "nome": "Eduardo", "total_cliente": 134.95, "total_pago": 134.95, "saldo_devedor": 0 },
  { "nome": "Guilherme", "total_cliente": 2.00, "total_pago": 2.00, "saldo_devedor": 0 },
  { "nome": "Diogo", "total_cliente": 0, "total_pago": 0, "saldo_devedor": 0 },
  { "nome": "Guarda Pass", "total_cliente": 215.92, "total_pago": 215.92, "saldo_devedor": 0 },
  { "nome": "Vivi do Corte", "total_cliente": 53.98, "total_pago": 0, "saldo_devedor": 53.98 },
  { "nome": "Jose Figuera", "total_cliente": 33.49, "total_pago": 0, "saldo_devedor": 33.49 },
  { "nome": "Patric Corte", "total_cliente": 26.99, "total_pago": 0, "saldo_devedor": 26.99 },
  { "nome": "Carol", "total_cliente": 24.99, "total_pago": 0, "saldo_devedor": 24.99 },
  { "nome": "Wslwy", "total_cliente": 15.00, "total_pago": 0, "saldo_devedor": 15.00, "telefone": "7 de Abril" },
  { "nome": "Davi", "total_cliente": 26.99, "total_pago": 0, "saldo_devedor": 26.99, "telefone": "7 de Abril" }
];

const cardapioData = {
  categorias: [
    { titulo: "Hot Dogs Tradicionais", ordem: 1 },
    { titulo: "Hot Dogs Especiais", ordem: 2 },
    { titulo: "Bebidas", ordem: 3 }
  ],
  produtos: [
    { titulo: "Dog Simples", descricao: "Pão, salsicha, tomate e maionese.", preco: 18.50, categoria_nome: "Hot Dogs Tradicionais" },
    { titulo: "Dog Duplo", descricao: "Pão, 2 salsichas, molho e milho.", preco: 23.90, categoria_nome: "Hot Dogs Tradicionais" },
    { titulo: "Coca-Cola 350ml", descricao: "Lata gelada.", preco: 7.00, categoria_nome: "Bebidas" }
  ]
}

async function seed() {
  console.log('--- Inserindo Dados Reais (Clientes e Cardápio) ---');

  // Clientes
  for (const c of clientesData) {
    console.log(`Clientes: ${c.nome}...`);
    await supabase.from('clientes').upsert(c, { onConflict: 'nome' });
  }

  // Categorias e Produtos
  for (const cat of cardapioData.categorias) {
    console.log(`Categoria: ${cat.titulo}...`);
    const { data: catData } = await supabase.from('categorias').upsert(cat, { onConflict: 'titulo' }).select().single();
    
    if (catData) {
      const prods = cardapioData.produtos.filter(p => p.categoria_nome === cat.titulo);
      for (const p of prods) {
        console.log(`Produto: ${p.titulo}...`);
        const { categoria_nome, ...prodToInsert } = p;
        await supabase.from('produtos').upsert({
          ...prodToInsert,
          categoria_id: catData.id
        }, { onConflict: 'titulo' });
      }
    }
  }

  console.log('--- Sincronização Final Concluída! ---');
}

seed();
