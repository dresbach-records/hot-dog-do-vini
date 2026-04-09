import { db } from '../../config/database.js';

export const dashboardService = {
  async getStats() {
    const [[{ total_vendas }]] = await db.query(
      "SELECT SUM(valor_total) as total_vendas FROM pedidos WHERE status != 'CANCELADO'"
    );

    const [[{ total_pedidos }]] = await db.query(
      "SELECT COUNT(*) as total_pedidos FROM pedidos WHERE status != 'CANCELADO'"
    );

    // Entradas do Caixa (Vendas confirmadas + lançamentos manuais)
    const [[{ total_recebido }]] = await db.query(
      "SELECT SUM(valor) as total_recebido FROM caixa_movimentacoes WHERE tipo = 'entrada'"
    );

    // Despesas Totais (Lançamentos manuais de despesas)
    const [[{ total_pago }]] = await db.query(
      "SELECT SUM(valor) as total_pago FROM despesas"
    );

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
  },

  async getChartsData() {
    // Faturamento por dia (Últimos 7 dias)
    const [dailySales] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%d/%m') as dia, SUM(valor_total) as vendas
      FROM pedidos 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      AND status != 'CANCELADO'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);

    // Fluxo de Caixa (Baseado em caixa_movimentacoes)
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

    // Top Produtos
    const [topProducts] = await db.query(`
      SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(item, '$.titulo')) as nome,
        SUM(JSON_EXTRACT(item, '$.qtd')) as qtd
      FROM pedidos,
      JSON_TABLE(itens, '$[*]' COLUMNS (item JSON PATH '$')) as jt
      WHERE status != 'CANCELADO'
      GROUP BY nome
      ORDER BY qtd DESC
      LIMIT 5
    `);

    // Fiado por Vencimento (Simplificado para dias de atraso baseado em clientes devedores)
    const [agingVencimentos] = await db.query(`
      SELECT 
        'Atrasado' as status,
        SUM(saldo_devedor) as valor
      FROM clientes
      WHERE saldo_devedor > 0
    `);

    return {
      dailySales,
      cashFlow,
      topProducts,
      agingVencimentos: agingVencimentos || []
    };
  }

    // Distribuição de Métodos de Pagamento
    const [paymentMethods] = await db.query(`
      SELECT forma_pagamento as metodo, SUM(total) as valor
      FROM pedidos
      WHERE status != 'CANCELADO'
      GROUP BY forma_pagamento
    `);

    return {
      dailySales,
      cashFlow,
      topProducts,
      agingVencimentos,
      paymentMethods
    };
  }
};
