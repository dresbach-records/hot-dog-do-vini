import { anotaaiService } from './anotaai.service.js';

export const anotaaiController = {
  /**
   * Importação de Catálogo do Anota AI
   */
  async importCatalog(req, res) {
    try {
      const { data } = req.body;
      if (!data || !Array.isArray(data)) {
        return res.status(400).json({ success: false, error: 'Dados do catálogo inválidos' });
      }
      
      const result = await anotaaiService.importCatalog(data);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: 'Erro ao sincronizar Anota AI' });
    }
  }
};
