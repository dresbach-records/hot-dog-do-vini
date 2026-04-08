import { query } from '../../infrastructure/database.js';

export const clientesService = {
  async list() {
    // Pegar clientes e seus pedidos (simulando a relação do Supabase)
    const clientes = await query('SELECT * FROM clientes');
    const pedidos = await query('SELECT * FROM pedidos');

    return clientes.map(cliente => ({
      ...cliente,
      pedidos: pedidos.filter(p => p.cliente_id === cliente.id)
    }));
  },

  async getById(id) {
    const [cliente] = await query('SELECT * FROM clientes WHERE id = ?', [id]);
    if (!cliente) return null;
    const pedidos = await query('SELECT * FROM pedidos WHERE cliente_id = ?', [id]);
    return { ...cliente, pedidos };
  },

  async create(data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const sql = `INSERT INTO clientes (${columns}) VALUES (${placeholders})`;
    await query(sql, values);
    return this.getById(data.id);
  },

  async update(id, data) {
    const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    const sql = `UPDATE clientes SET ${sets} WHERE id = ?`;
    await query(sql, values);
    return this.getById(id);
  }
};
