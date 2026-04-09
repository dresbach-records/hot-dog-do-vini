import { db } from '../../config/database.js';
import { crypto } from 'crypto';

export const caixaService = {
  async getActiveSession(userId) {
    const [rows] = await db.query(
      'SELECT * FROM caixa_sessoes WHERE operador_id = ? AND status = "aberto" LIMIT 1',
      [userId]
    );
    return rows[0];
  },

  async openSession(userId, valorAbertura) {
    const active = await this.getActiveSession(userId);
    if (active) throw new Error('Já existe uma sessão aberta para este operador.');

    const id = crypto.randomUUID();
    await db.query(
      'INSERT INTO caixa_sessoes (id, operador_id, valor_abertura, status) VALUES (?, ?, ?, "aberto")',
      [id, userId, valorAbertura]
    );

    return { id, status: 'aberto', valor_abertura: valorAbertura };
  },

  async closeSession(sessionId, valorFechamento) {
    await db.query(
      'UPDATE caixa_sessoes SET fechado_em = CURRENT_TIMESTAMP, valor_fechamento = ?, status = "fechado" WHERE id = ?',
      [valorFechamento, sessionId]
    );

    return { id: sessionId, status: 'fechado', valor_fechamento: valorFechamento };
  },

  async getResumo(sessionId) {
    // 1. Valor de Abertura
    const [sessionRows] = await db.query('SELECT valor_abertura FROM caixa_sessoes WHERE id = ?', [sessionId]);
    const abertura = Number(sessionRows[0]?.valor_abertura || 0);

    // 2. Total por método de pagamento (vendas vinculadas à data da sessão ou pedidos concluídos durante a sessão)
    // Para simplificar agora, pegaremos todos os pagamentos 'pagos' 
    // Em um sistema real, vincularíamos o pedido_id à sessão_id
    const [paymentRows] = await db.query(`
      SELECT metodo, SUM(valor) as total 
      FROM pedido_pagamentos 
      WHERE status = 'pago' 
      GROUP BY metodo
    `);

    return {
      abertura,
      vendas: paymentRows,
      total_vendas: paymentRows.reduce((acc, curr) => acc + Number(curr.total), 0)
    };
  }
};
