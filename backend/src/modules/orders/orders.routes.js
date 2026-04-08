import express from 'express';
import { ordersController } from './orders.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * 🔐 ROTAS PROTEGIDAS (POST/GET /api/orders)
 */
// Criar Pedido (Autenticado)
router.post('/', authMiddleware, ordersController.create);

// Listar Meus Pedidos (Autenticado)
router.get('/me', authMiddleware, ordersController.listMe);

// Atualizar Pedido (Autenticado)
router.put('/:id', authMiddleware, ordersController.update);

export default router;
