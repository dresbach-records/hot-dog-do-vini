import { juridicoService } from './juridico.service.js';

export const juridicoController = {
  // --- TEMPLATES ---
  async listTemplates(req, res) {
    try {
      const data = await juridicoService.listTemplates();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao buscar modelos' });
    }
  },

  async createTemplate(req, res) {
    try {
      const result = await juridicoService.createTemplate(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao criar modelo' });
    }
  },

  // --- CONTRATOS ---
  async listContracts(req, res) {
    try {
      const data = await juridicoService.listContracts();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao buscar contratos' });
    }
  },

  async generateContract(req, res) {
    try {
      const result = await juridicoService.generateContract(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // --- DOCUMENTOS ---
  async listDocuments(req, res) {
    try {
      const data = await juridicoService.listDocuments();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao buscar documentos' });
    }
  },

  async createDocument(req, res) {
    try {
      const result = await juridicoService.createDocument(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao cadastrar documento' });
    }
  },

  async updateTemplate(req, res) {
    try {
      const result = await juridicoService.updateTemplate(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao atualizar modelo' });
    }
  },

  async listFiscalSales(req, res) {
    try {
      const data = await juridicoService.listFiscalSales();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao buscar vendas fiscais' });
    }
  },

  async createFiscalSale(req, res) {
    try {
      const result = await juridicoService.createFiscalSale(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao registrar venda fiscal' });
    }
  }
};
