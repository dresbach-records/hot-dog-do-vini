import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../backend/.env') });

const dbConfig = {
  host: process.env.DB_HOST || '187.127.17.241',
  user: process.env.DB_USERNAME || 'hotdog_user',
  password: process.env.DB_PASSWORD || 'SenhaForte123!',
  database: process.env.DB_DATABASE || 'hotdog_db'
};

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
    { nome: "Hot Dogs Tradicionais", ordem: 1 },
    { nome: "Hot Dogs Especiais", ordem: 2 },
    { nome: "Bebidas", ordem: 3 }
  ],
  produtos: [
    { titulo: "Dog Simples", descricao: "Pão, salsicha, tomate e maionese.", preco: 18.50, categoria_nome: "Hot Dogs Tradicionais" },
    { titulo: "Dog Duplo", descricao: "Pão, 2 salsichas, molho e milho.", preco: 23.90, categoria_nome: "Hot Dogs Tradicionais" },
    { titulo: "Coca-Cola 350ml", descricao: "Lata gelada.", preco: 7.00, categoria_nome: "Bebidas" }
  ]
}

async function seed() {
  console.log('--- Inserindo Dados Reais (MySQL/VPS) ---');
  const conn = await mysql.createConnection(dbConfig);

  try {
    // Clientes
    for (const c of clientesData) {
      console.log(`Clientes: ${c.nome}...`);
      await conn.query(
        `INSERT INTO clientes (id, nome, total_cliente, total_pago, saldo_devedor, telefone) 
         VALUES (?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE total_cliente = VALUES(total_cliente), total_pago = VALUES(total_pago), saldo_devedor = VALUES(saldo_devedor), telefone = VALUES(telefone)`,
        [uuidv4(), c.nome, c.total_cliente, c.total_pago, c.saldo_devedor, c.telefone || '']
      );
    }

    // Categorias e Produtos
    for (const cat of cardapioData.categorias) {
      console.log(`Categoria: ${cat.nome}...`);
      
      const newCatId = uuidv4();
      await conn.query(
        'INSERT INTO categorias (id, nome, ordem) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE ordem = VALUES(ordem)',
        [newCatId, cat.nome, cat.ordem]
      );
      
      // Pegar ID da categoria (seja o novo ou o existente)
      const [rows] = await conn.query('SELECT id FROM categorias WHERE nome = ?', [cat.nome]);
      const catId = rows[0].id;

      const prods = cardapioData.produtos.filter(p => p.categoria_nome === cat.nome);
      for (const p of prods) {
        console.log(`Produto: ${p.titulo}...`);
        await conn.query(
          `INSERT INTO produtos (id, categoria_id, titulo, descricao, preco) 
           VALUES (?, ?, ?, ?, ?) 
           ON DUPLICATE KEY UPDATE categoria_id = VALUES(categoria_id), descricao = VALUES(descricao), preco = VALUES(preco)`,
          [uuidv4(), catId, p.titulo, p.descricao, p.preco]
        );
      }
    }

    console.log('--- Sincronização Final Concluída! ---');
  } catch (err) {
    console.error('❌ Erro no seed:', err.message);
  } finally {
    await conn.end();
  }
}

seed();

