import { filiaisService } from './filiais.service.js';

export const filiaisController = {
  async list(req, res) {
    try {
      const data = await filiaisService.list();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async create(req, res) {
    try {
      const result = await filiaisService.create(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async update(req, res) {
    try {
      const result = await filiaisService.update(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const result = await filiaisService.delete(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
