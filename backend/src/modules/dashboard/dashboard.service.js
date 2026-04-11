import { db } from '../../config/database.js';

/**
 * Dashboard Service Industrial - Foco em Performance SQL
 */
export const dashboardService = {
  
  async getStats() {
    try {
      // Executa múltiplas queries em paralelo para KPIs em tempo real
      const [
        [[{ total_vendas }]], 
        [[{ total_pedidos }]], 
        [[{ total_recebido }]], 
        [[{ total_despesas }]], 
        [[{ total_em_aberto }]]
      ] = await Promise.all([
        db.query("SELECT SUM(total) as total_vendas FROM pedidos WHERE status != 'CANCELADO'"),
        db.query("SELECT COUNT(*) as total_pedidos FROM pedidos WHERE status != 'CANCELADO'"),
        db.query("SELECT SUM(valor) as total_recebido FROM caixa_movimentacoes WHERE tipo = 'entrada'"),
        db.query("SELECT SUM(valor) as total_despesas FROM despesas"),
        db.query("SELECT SUM(saldo_devedor) as total_em_aberto FROM clientes")
      ]);

      return {
        totalSales: Number(total_vendas) || 0,
        totalOrders: Number(total_pedidos) || 0,
        totalIncome: Number(total_recebido) || 0,
        totalExpense: Number(total_despesas) || 0,
        totalPending: Number(total_em_aberto) || 0,
      };
    } catch (err) {
      console.error('[Dashboard Stats Critical Error]', err.message);
      throw new Error('Falha ao consolidar métricas de BI');
    }
  },

  async getChartsData() {
    try {
      // 1. Faturamento por dia (Últimos 7 dias)
      const [dailySales] = await db.query(`
        SELECT DATE_FORMAT(created_at, '%d/%m') as dia, SUM(total) as vendas
        FROM pedidos 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND status != 'CANCELADO'
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
      `);

      // 2. Fluxo de Caixa (Entradas vs Saídas)
      const [cashFlow] = await db.query(`
        SELECT 
          DATE_FORMAT(created_at, '%d/%m') as dia,
          SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as entradas,
          SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as saidas
        FROM caixa_movimentacoes
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
      `);

      // 3. Top Produtos (Análise Profunda por JSON)
      const [topProducts] = await db.query(`
        SELECT 
          JSON_UNQUOTE(JSON_EXTRACT(item, '$.titulo')) as nome,
          SUM(JSON_EXTRACT(item, '$.quantidade')) as qtd
        FROM pedidos,
        JSON_TABLE(itens, '$[*]' COLUMNS (item JSON PATH '$')) as jt
        WHERE status != 'CANCELADO'
        GROUP BY nome
        ORDER BY qtd DESC
        LIMIT 5
      `);

      // 4. Fiado por Vencimento (Status de Risco)
      const [agingVencimentos] = await db.query(`
        SELECT 
          CASE 
            WHEN saldo_devedor > 0 THEN 'Pendente'
            ELSE 'Em dia'
          END as status,
          SUM(saldo_devedor) as valor
        FROM clientes
        GROUP BY status
      `);

      return {
        dailySales: dailySales || [],
        cashFlow: cashFlow || [],
        topProducts: topProducts || [],
        agingVencimentos: agingVencimentos || []
      };
    } catch (err) {
      console.error('[Dashboard Charts Critical Error]', err.message);
      return { dailySales: [], cashFlow: [], topProducts: [], agingVencimentos: [] };
    }
  }
};
