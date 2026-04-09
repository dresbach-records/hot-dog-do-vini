import { cuponsService } from './cupons.service.js';

export const cuponsController = {
  async list(req, res) {
    const data = await cuponsService.list();
    res.json({ success: true, data });
  },

  async validate(req, res) {
    const { codigo, total } = req.body;
    try {
      const data = await cuponsService.validate(codigo, total);
      res.json({ success: true, data });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async create(req, res) {
    const data = await cuponsService.create(req.body);
    res.status(201).json({ success: true, data });
  },

  async delete(req, res) {
    const { id } = req.params;
    await cuponsService.delete(id);
    res.json({ success: true });
  }
};
