import { despesasService } from './despesas.service.js';

export const despesasController = {
  async list(req, res) {
    const data = await despesasService.list();
    return res.success(data);
  },

  async create(req, res) {
    const data = await despesasService.create(req.body);
    return res.success(data, 201);
  },

  async delete(req, res) {
    const { id } = req.params;
    await despesasService.delete(id);
    return res.success({ message: 'Despesa removida com sucesso' });
  }
};
