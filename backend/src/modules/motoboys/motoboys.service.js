import { query } from '../../config/database.js';
import crypto from 'node:crypto';

export const motoboysService = {
  async list() {
    return await query('SELECT * FROM motoboys ORDER BY nome ASC');
  },
  async update(id, data) {
    const fields = Object.keys(data);
    const values = [...Object.values(data), id];
    const sets = fields.map(field => `${field} = ?`).join(', ');

    await query(`UPDATE motoboys SET ${sets} WHERE id = ?`, values);
    return { id, ...data };
  },

  async delete(id) {
    await query('DELETE FROM motoboys WHERE id = ?', [id]);
    return { success: true };
  }
};
