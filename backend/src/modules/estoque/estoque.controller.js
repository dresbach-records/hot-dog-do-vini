import { estoqueService } from './estoque.service.js';

export const estoqueController = {
  async listInsumos(req, res) {
    const data = await estoqueService.listInsumos();
    return res.success(data);
  },

  async createInsumo(req, res) {
    const data = await estoqueService.createInsumo(req.body);
    return res.success(data, 201);
  },

  async movimentar(req, res) {
    const { id } = req.params;
    const { quantidade, motivo } = req.body;
    await estoqueService.movimentar(id, quantidade, motivo);
    return res.success({ message: 'Estoque atualizado' });
  },

  async saveReceita(req, res) {
    const { produto_id, insumos } = req.body;
    await estoqueService.saveReceita(produto_id, insumos);
    return res.success({ message: 'Receita salva com sucesso' });
  },

  async getReceita(req, res) {
    const { id } = req.params;
    const data = await estoqueService.getReceita(id);
    return res.success(data);
  }
};
