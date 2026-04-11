import { rhService } from './rh.service.js';

export const rhController = {
  async list(req, res) {
    const data = await rhService.list();
    return res.success(data);
  },

  async create(req, res) {
    const data = await rhService.create(req.body);
    return res.success(data, 201);
  },

  async update(req, res) {
    const { id } = req.params;
    const data = await rhService.update(id, req.body);
    return res.success(data);
  },

  async delete(req, res) {
    const { id } = req.params;
    await rhService.delete(id);
    return res.success({ message: 'Funcionário removido com sucesso' });
  }
};
