import { marketingService } from './marketing.service.js';

export const marketingController = {
  // CAMPANHAS
  async listCampanhas(req, res) {
    try {
      const data = await marketingService.listCampanhas();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao buscar campanhas' });
    }
  },

  async createCampanha(req, res) {
    try {
      const result = await marketingService.createCampanha(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao criar campanha' });
    }
  },

  // CUPONS
  async listCupons(req, res) {
    try {
      const data = await marketingService.listCupons();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao buscar cupons' });
    }
  },

  async createCupom(req, res) {
    try {
      const result = await marketingService.createCupom(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao criar cupom' });
    }
  },

  async toggleCupom(req, res) {
    try {
      const result = await marketingService.toggleCupom(req.params.id, req.body.active);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao alterar status do cupom' });
    }
  }
};
