import { categoriesService } from './products.service.js';

export const categoriesController = {
  async list(req, res) {
    const data = await categoriesService.list();
    res.json({ success: true, data });
  },

  async create(req, res) {
    const data = await categoriesService.create(req.body);
    res.status(201).json({ success: true, data });
  },

  async update(req, res) {
    const { id } = req.params;
    const data = await categoriesService.update(id, req.body);
    res.json({ success: true, data });
  },

  async delete(req, res) {
    const { id } = req.params;
    await categoriesService.delete(id);
    res.json({ success: true });
  }
};
