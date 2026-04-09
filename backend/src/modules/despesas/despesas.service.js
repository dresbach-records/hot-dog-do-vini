import { query } from '../../config/database.js';

export const despesasService = {
  async list() {
    return await query('SELECT * FROM despesas ORDER BY vencimento ASC');
  },

  async create(data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    const result = await query(`INSERT INTO despesas (${columns}) VALUES (${placeholders})`, values);
    return { id: result.insertId, ...data };
  },

  async update(id, data) {
    const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    await query(`UPDATE despesas SET ${sets} WHERE id = ?`, values);
    return { id, ...data };
  },

  async delete(id) {
    await query('DELETE FROM despesas WHERE id = ?', [id]);
    return { success: true };
  }
};
