import { despesasService } from './despesas.service.js';

export const despesasController = {
  async list(req, res) {
    const data = await despesasService.list();
    res.json({ success: true, data });
  },

  async create(req, res) {
    const data = await despesasService.create(req.body);
    res.status(201).json({ success: true, data });
  },

  async update(req, res) {
    const { id } = req.params;
    const data = await despesasService.update(id, req.body);
    res.json({ success: true, data });
  },

  async delete(req, res) {
    const { id } = req.params;
    await despesasService.delete(id);
    res.json({ success: true });
  }
};
