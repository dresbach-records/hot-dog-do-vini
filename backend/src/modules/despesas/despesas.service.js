import { db } from '../../config/database.js';
import crypto from 'node:crypto';

export const despesasService = {
  async list() {
    const [rows] = await db.query('SELECT * FROM despesas ORDER BY created_at DESC');
    return rows;
  },

  async create(data) {
    const id = crypto.randomUUID();
    const { descricao, valor, categoria, pago, data_pagamento } = data;
    await db.query(
      'INSERT INTO despesas (id, descricao, valor, categoria, pago, data_pagamento) VALUES (?, ?, ?, ?, ?, ?)',
      [id, descricao, valor, categoria, pago ? 1 : 0, data_pagamento]
    );

    // Se estiver pago, gera saída automática no caixa
    if (pago) {
      await db.query(
        'INSERT INTO caixa_movimentacoes (id, tipo, valor, origem) VALUES (?, ?, ?, ?)',
        [crypto.randomUUID(), 'saida', valor, `Despesa: ${descricao}`]
      );
    }

    return { id, ...data };
  },

  async delete(id) {
    await db.query('DELETE FROM despesas WHERE id = ?', [id]);
    return { success: true };
  }
};
