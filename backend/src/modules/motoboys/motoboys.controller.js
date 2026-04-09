import { motoboysService } from './motoboys.service.js';

export const motoboysController = {
  async list(req, res) {
    const data = await motoboysService.list();
    res.json({ success: true, data });
  },

  async create(req, res) {
    const data = await motoboysService.create(req.body);
    res.status(201).json({ success: true, data });
  },

  async update(req, res) {
    const { id } = req.params;
    const data = await motoboysService.update(id, req.body);
    res.json({ success: true, data });
  },

  async delete(req, res) {
    const { id } = req.params;
    await motoboysService.delete(id);
    res.json({ success: true });
  }
};
