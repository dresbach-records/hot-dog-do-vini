import { query } from '../../config/database.js';

export const productsService = {
  async list() {
    return await query('SELECT * FROM produtos ORDER BY titulo');
  },

  async listActive() {
    return await query('SELECT * FROM produtos WHERE disponivel = 1 ORDER BY titulo');
  },

  async getById(id) {
    const [product] = await query('SELECT * FROM produtos WHERE id = ?', [id]);
    return product;
  },

  async create(data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const result = await query(`INSERT INTO produtos (${columns}) VALUES (${placeholders})`, values);
    return { id: result.insertId, ...data };
  },

  async update(id, data) {
    const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    await query(`UPDATE produtos SET ${sets} WHERE id = ?`, values);
    return this.getById(id);
  },

  async delete(id) {
    await query('DELETE FROM produtos WHERE id = ?', [id]);
    return { success: true };
  }
};

export const categoriesService = {
  async list() {
    return await query('SELECT * FROM categorias ORDER BY ordem');
  },

  async create(data) {
    const result = await query('INSERT INTO categorias (nome, ordem) VALUES (?, ?)', [data.nome, data.ordem || 0]);
    return { id: result.insertId, ...data };
  },

  async update(id, data) {
    const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    await query(`UPDATE categorias SET ${sets} WHERE id = ?`, values);
    return { id, ...data };
  },

  async delete(id) {
     await query('DELETE FROM categorias WHERE id = ?', [id]);
     return { success: true };
  }
};
