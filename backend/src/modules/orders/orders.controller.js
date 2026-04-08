import { CreateOrderSchema } from './orders.schema.js';
import { ordersService } from './orders.service.js';

/**
 * Controller de Pedidos — Orquestração de entrada e saída
 */
export const ordersController = {
  
  /**
   * Criar Pedido (POST /api/orders)
   * AuthMiddleware já garante req.user aqui
   */
  async create(req, res) {
    const { body, user } = req;

    // 1. VALIDAÇÃO DE ESQUEMA (ZOD)
    // Se falhar, o app.js captura automaticamente via middleware de erro
    const validatedData = CreateOrderSchema.parse(body);

    const result = await ordersService.create(validatedData, user);
    
    res.status(201).json(result);
  },

  /**
   * Listar Pedidos do Usuário (GET /api/orders)
   */
  async listMe(req, res) {
    const { user } = req;
    const result = await ordersService.listByUser(user.id);
    res.json(result);
  },

  /**
   * Atualizar Pedido (PUT /api/orders/:id)
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const result = await ordersService.update(id, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
