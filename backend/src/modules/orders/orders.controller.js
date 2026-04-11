import { ordersService } from './orders.service.js';

export const ordersController = {
  async list(req, res) {
    const data = await ordersService.listByUser(req.user.id);
    res.json(data);
  },

  async listAll(req, res) {
    // Admin list
    const data = await query('SELECT * FROM pedidos ORDER BY created_at DESC');
    res.json({ success: true, data });
  },

  async getById(req, res) {
    const { id } = req.params;
    const [data] = await query('SELECT * FROM pedidos WHERE id = ?', [id]);
    if (!data) return res.status(404).json({ success: false, error: 'Pedido não encontrado' });
    res.json({ success: true, data });
  },

  async create(req, res) {
    try {
      const result = await ordersService.create(req.body, req.user);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async updateStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const data = await ordersService.updateStatus(id, status, req.user?.id);
    res.json({ success: true, data });
  },

  async despachar(req, res) {
    const { id } = req.params;
    const { motoboy_id } = req.body;
    await ordersService.despachar(id, motoboy_id, req.user?.id);
    res.json({ success: true, message: 'Pedido despachado' });
  },

  async delete(req, res) {
    const { id } = req.params;
    await query('DELETE FROM pedidos WHERE id = ?', [id]);
    res.json({ success: true });
  }
};
