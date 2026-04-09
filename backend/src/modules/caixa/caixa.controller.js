import { caixaService } from './caixa.service.js';

export const caixaController = {
  async getActiveSession(req, res) {
    const data = await caixaService.getActiveSession(req.user.id);
    return res.success(data);
  },

  async open(req, res) {
    const { valor_abertura } = req.body;
    if (valor_abertura === undefined) return res.error('Valor de abertura é obrigatório', 400);
    
    const data = await caixaService.openSession(req.user.id, valor_abertura);
    return res.success(data, 201);
  },

  async close(req, res) {
    const { id } = req.params;
    const { valor_fechamento } = req.body;
    if (valor_fechamento === undefined) return res.error('Valor de fechamento é obrigatório', 400);

    const data = await caixaService.closeSession(id, valor_fechamento);
    return res.success(data);
  },

  async getResumo(req, res) {
    const { id } = req.params;
    const data = await caixaService.getResumo(id);
    return res.success(data);
  }
};
