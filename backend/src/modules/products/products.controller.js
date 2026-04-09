import { productsService } from './products.service.js';

export const productsController = {
  async list(req, res) {
    const data = await productsService.list();
    return res.success(data);
  },

  async listActive(req, res) {
    const data = await productsService.listActive();
    return res.success(data);
  },

  async getById(req, res) {
    const { id } = req.params;
    const data = await productsService.getById(id);
    if (!data) return res.error('Produto não encontrado', 404);
    return res.success(data);
  },

  async create(req, res) {
    const data = await productsService.create(req.body);
    return res.success(data, 201);
  },

  async update(req, res) {
    const { id } = req.params;
    const data = await productsService.update(id, req.body);
    return res.success(data);
  },

  async delete(req, res) {
    const { id } = req.params;
    await productsService.delete(id);
    return res.success({ message: 'Produto removido com sucesso' });
  }

};
