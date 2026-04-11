import { db } from '../../config/database.js';
import crypto from 'node:crypto';

export const estoqueService = {
  // --- INSUMOS ---
  async listInsumos() {
    const [rows] = await db.query('SELECT * FROM insumos ORDER BY nome ASC');
    return rows;
  },

  async createInsumo(data) {
    const id = crypto.randomUUID();
    const { nome, categoria, quantidade, minimo, unidade, custo_unitario } = data;
    await db.query(
      'INSERT INTO insumos (id, nome, categoria, quantidade, minimo, unidade, custo_unitario) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, nome, categoria, quantidade, minimo, unidade, custo_unitario]
    );
    return { id, ...data };
  },

  async movimentar(id, qtd, motivo) {
    // qtd pode ser negativa para saída
    await db.query('UPDATE insumos SET quantidade = quantidade + ? WHERE id = ?', [qtd, id]);
    
    // Log de movimentação (opcional, mas bom para auditoria)
    console.log(`[Estoque] Movimentação: ${qtd} no insumo ${id}. Motivo: ${motivo}`);
    
    return { success: true };
  },

  // --- RECEITAS (PRODUTO_INSUMOS) ---
  async saveReceita(produtoId, insumos) {
    // Limpa a receita anterior
    await db.query('DELETE FROM produto_insumos WHERE produto_id = ?', [produtoId]);
    
    // Insere os novos itens da receita
    for (const item of insumos) {
      await db.query(
        'INSERT INTO produto_insumos (id, produto_id, insumo_id, quantidade_necessaria) VALUES (?, ?, ?, ?)',
        [crypto.randomUUID(), produtoId, item.insumo_id, item.quantidade_necessaria]
      );
    }
    return { success: true };
  },

  async getReceita(produtoId) {
    const [rows] = await db.query(
      'SELECT pi.*, i.nome, i.unidade FROM produto_insumos pi JOIN insumos i ON pi.insumo_id = i.id WHERE pi.produto_id = ?',
      [produtoId]
    );
    return rows;
  }
};
