import { ifoodService } from './ifood.service.js';

/**
 * iFood Integration Controller
 */
export const ifoodController = {
  
  /**
   * Endpoint para iniciar autenticação
   */
  async startAuth(req, res) {
    try {
      const data = await ifoodService.authStart();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Endpoint para confirmar autenticação
   */
  async confirmAuth(req, res) {
    try {
      const { code } = req.body;
      const data = await ifoodService.authConfirm(code);
      res.json(data);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Endpoint para importar cardápio (Frontend -> MariaDB)
   */
  async importCatalog(req, res) {
    try {
      const { catalog } = req.body;
      if (!catalog || !Array.isArray(catalog)) {
        return res.status(400).json({ success: false, error: 'Catálogo inválido' });
      }
      
      const result = await ifoodService.importCatalog(catalog);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
