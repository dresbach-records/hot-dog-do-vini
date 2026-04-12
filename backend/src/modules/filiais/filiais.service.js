import { query } from '../../config/database.js';
import crypto from 'node:crypto';

export const filiaisService = {
  async list() {
    return await query('SELECT * FROM filiais ORDER BY nome ASC');
  },

  async create(dados) {
    const id = crypto.randomUUID();
    await query(
      'INSERT INTO filiais (id, nome, endereco, responsavel, meta, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, dados.nome, dados.endereco, dados.responsavel, dados.meta || 0, 'ativo']
    );
    return { success: true, id };
  },

  async update(id, dados) {
    await query(
      'UPDATE filiais SET nome = ?, endereco = ?, responsavel = ?, meta = ?, status = ? WHERE id = ?',
      [dados.nome, dados.endereco, dados.responsavel, dados.meta, dados.status, id]
    );
    return { success: true };
  },

  async delete(id) {
    await query('DELETE FROM filiais WHERE id = ?', [id]);
    return { success: true };
  }
};
