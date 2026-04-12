import express from 'express';
import { pagarmeService } from './pagarme.service.js';
import { authenticate } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

// Busca saldo da conta
router.get('/balance', authenticate, async (req, res) => {
  try {
    const data = await pagarmeService.getBalance();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao buscar saldo no Pagar.me' });
  }
});

// Lista pedidos/cobranças
router.get('/orders', authenticate, async (req, res) => {
  try {
    const data = await pagarmeService.listOrders(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erro ao listar pedidos no Pagar.me' });
  }
});

export default router;
