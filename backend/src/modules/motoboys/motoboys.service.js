import { query } from '../../config/database.js';

export const motoboysService = {
  async list() {
    return await query('SELECT * FROM motoboys ORDER BY nome ASC');
  },

  async create(data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    const result = await query(`INSERT INTO motoboys (${columns}) VALUES (${placeholders})`, values);
    return { id: result.insertId, ...data };
  },

  async update(id, data) {
    const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    await query(`UPDATE motoboys SET ${sets} WHERE id = ?`, values);
    return { id, ...data };
  },

  async delete(id) {
    await query('DELETE FROM motoboys WHERE id = ?', [id]);
    return { success: true };
  }
};
