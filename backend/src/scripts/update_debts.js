import { query } from '../infrastructure/database.js';
import { v4 as uuidv4 } from 'uuid';

async function updateDebts() {
  console.log('🔄 Iniciando atualização de dívidas...');

  try {
    // 1. Resetar saldo devedor de todos (caso existisse algum)
    // Como a tabela está vazia nos meus testes, isso não afetará nada, mas segue a lógica "todo mundo pagou"
    await query('UPDATE clientes SET saldo_devedor = 0');
    console.log('✅ Todos os saldos resetados.');

    const data = [
      {
        id: uuidv4(),
        nome: 'Jose Figueroa',
        empresa: 'Venezuelanos',
        saldo_devedor: 140.00,
        status_integracao: 'calote financeiro'
      },
      {
        id: uuidv4(),
        nome: 'Vive Diva',
        saldo_devedor: 26.99
      },
      {
        id: uuidv4(),
        nome: 'Davi',
        saldo_devedor: 0.00
      }
    ];

    for (const person of data) {
      // Usar INSERT ... ON DUPLICATE KEY UPDATE ou apenas INSERT se soubermos que não existe
      // Mas como a tabela está vazia, INSERT é seguro. 
      // Vou usar uma lógica de busca por nome para evitar duplicatas caso o script rode duas vezes.
      
      const [existing] = await query('SELECT id FROM clientes WHERE nome = ?', [person.nome]);
      
      if (existing) {
        console.log(`Updating ${person.nome}...`);
        await query('UPDATE clientes SET saldo_devedor = ?, empresa = ?, status_integracao = ? WHERE id = ?', [
          person.saldo_devedor, 
          person.empresa || null, 
          person.status_integracao || 'nenhuma', 
          existing.id
        ]);
      } else {
        console.log(`Inserting ${person.nome}...`);
        await query('INSERT INTO clientes (id, nome, empresa, saldo_devedor, status_integracao) VALUES (?, ?, ?, ?, ?)', [
          person.id,
          person.nome,
          person.empresa || null,
          person.saldo_devedor,
          person.status_integracao || 'nenhuma'
        ]);
      }
    }

    console.log('🚀 Banco de dados atualizado com sucesso!');
    
    // Listar resultado final
    const final = await query('SELECT nome, saldo_devedor, empresa, status_integracao FROM clientes');
    console.log('Estado atual da tabela clientes:');
    console.table(final);

  } catch (error) {
    console.error('❌ Erro ao atualizar dívidas:', error);
  } finally {
    process.exit(0);
  }
}

updateDebts();
