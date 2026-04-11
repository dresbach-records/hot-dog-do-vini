import { db } from '../../config/database.js';

export const dashboardService = {
  async getStats() {
    try {
      const [[{ total_vendas }]] = await db.query(
        "SELECT SUM(total) as total_vendas FROM pedidos WHERE status != 'CANCELADO'"
      );

      const [[{ total_pedidos }]] = await db.query(
        "SELECT COUNT(*) as total_pedidos FROM pedidos WHERE status != 'CANCELADO'"
      );

      // Entradas do Caixa (Vendas confirmadas + lançamentos manuais)
      // Adicionado try-catch individual ou check de existência de tabela se possível
      let total_recebido = 0;
      try {
        const [res] = await db.query("SELECT SUM(valor) as total_recebido FROM caixa_movimentacoes WHERE tipo = 'entrada'");
        total_recebido = res[0]?.total_recebido || 0;
      } catch (e) {
        console.warn('Tabela caixa_movimentacoes não encontrada ou erro na query');
      }

      // Despesas Totais
      let total_pago = 0;
      try {
        const [res] = await db.query("SELECT SUM(valor) as total_pago FROM despesas");
        total_pago = res[0]?.total_pago || 0;
      } catch (e) {
        console.warn('Tabela despesas não encontrada');
      }

      // Saldo em aberto (Clientes devedores)
      const [[{ total_em_aberto }]] = await db.query(
        "SELECT SUM(saldo_devedor) as total_em_aberto FROM clientes"
      );

      return {
        totalSales: Number(total_vendas) || 0,
        totalOrders: total_pedidos || 0,
        totalIncome: Number(total_recebido) || 0,
        totalExpense: Number(total_pago) || 0,
        totalPending: Number(total_em_aberto) || 0,
      };
    } catch (err) {
      console.error('[Dashboard Stats Error]', err);
      // Fallback para zeros se algo falhar drasticamente
      return { totalSales: 0, totalOrders: 0, totalIncome: 0, totalExpense: 0, totalPending: 0 };
    }
  },

  async getChartsData() {
    try {
      // Faturamento por dia (Últimos 7 dias) - Ajustado para 'total'
      const [dailySales] = await db.query(`
        SELECT DATE_FORMAT(created_at, '%d/%m') as dia, SUM(total) as vendas
        FROM pedidos 
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND status != 'CANCELADO'
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
      `);

      // Fluxo de Caixa
      let cashFlow = [];
      try {
        [cashFlow] = await db.query(`
          SELECT 
            DATE_FORMAT(created_at, '%d/%m') as dia,
            SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as entradas,
            SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as saidas
          FROM caixa_movimentacoes
          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          GROUP BY DATE(created_at)
          ORDER BY DATE(created_at) ASC
        `);
      } catch (e) {}

      // Top Produtos
      const [topProducts] = await db.query(`
        SELECT 
          JSON_UNQUOTE(JSON_EXTRACT(item, '$.titulo')) as nome,
          SUM(JSON_EXTRACT(item, '$.qtd')) as qtd
        FROM pedidos,
        JSON_TABLE(itens, '$[*]' COLUMNS (item JSON PATH '$')) as jt
        WHERE status != 'CANCELADO'
        AND itens IS NOT NULL
        GROUP BY nome
        ORDER BY qtd DESC
        LIMIT 5
      `);

      // Fiado por Vencimento
      const [agingVencimentos] = await db.query(`
        SELECT 
          'Atrasado' as status,
          SUM(saldo_devedor) as valor
        FROM clientes
        WHERE saldo_devedor > 0
      `);

      // Distribuição de Métodos de Pagamento - Ajustado para 'total'
      const [paymentMethods] = await db.query(`
        SELECT forma_pagamento as metodo, SUM(total) as valor
        FROM pedidos
        WHERE status != 'CANCELADO'
        GROUP BY forma_pagamento
      `);

      return {
        dailySales: dailySales || [],
        cashFlow: cashFlow || [],
        topProducts: topProducts || [],
        agingVencimentos: agingVencimentos || [],
        paymentMethods: paymentMethods || []
      };
    } catch (err) {
      console.error('[Dashboard Charts Error]', err);
      return { dailySales: [], cashFlow: [], topProducts: [], agingVencimentos: [], paymentMethods: [] };
    }
  }
};
