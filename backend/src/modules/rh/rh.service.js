import { db } from '../../config/database.js';
import crypto from 'node:crypto';

export const rhService = {
  async list() {
    const [rows] = await db.query('SELECT * FROM funcionarios ORDER BY nome ASC');
    return rows;
  },

  async create(data) {
    const id = crypto.randomUUID();
    const { nome, cargo, salario, data_admissao, status } = data;
    await db.query(
      'INSERT INTO funcionarios (id, nome, cargo, salario, data_admissao, status) VALUES (?, ?, ?, ?, ?, ?)',
      [id, nome, cargo, salario, data_admissao, status || 'ativo']
    );
    return { id, ...data };
  },

  async update(id, data) {
    const { nome, cargo, salario, data_admissao, status } = data;
    await db.query(
      'UPDATE funcionarios SET nome = ?, cargo = ?, salario = ?, data_admissao = ?, status = ? WHERE id = ?',
      [nome, cargo, salario, data_admissao, status, id]
    );
    return { id, ...data };
  },

  async delete(id) {
    await db.query('DELETE FROM funcionarios WHERE id = ?', [id]);
    return { success: true };
  }
};
