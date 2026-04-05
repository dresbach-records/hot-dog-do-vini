import express from 'express';
import ordersRoutes from '../modules/orders/orders.routes.js';
import productsRoutes from '../modules/products/products.routes.js';
import { ifoodService } from '../modules/integrations/ifood/ifood.service.js';

const router = express.Router();

/**
 * 🛒 MÓDULO: PRODUTOS (/api/products)
 */
router.use('/products', productsRoutes);

/**
 * 📦 MÓDULO: PEDIDOS (/api/orders)
 */
router.use('/orders', ordersRoutes);

/**
 * 📡 MÓDULO: INTEGRAÇÕES iFOOD (/api/ifood)
 * Proxy Seguro para Merchant API
 */

// Login iFood: Inicia Fluxo
router.post('/ifood/auth/start', async (req, res) => {
  try {
    const data = await ifoodService.authStart();
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login iFood: Confirma
router.post('/ifood/auth/confirm', async (req, res) => {
  try {
    const { authorizationCode } = req.body;
    const result = await ifoodService.authConfirm(authorizationCode);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Status iFood
router.get('/ifood/status', async (req, res) => {
  try {
    const tokens = ifoodService.lerTokens();
    if (!tokens) return res.json({ success: true, connected: false });
    
    // Testa validade do token
    await ifoodService.getAccessToken();
    res.json({ success: true, connected: true });
  } catch (err) {
    res.json({ success: true, connected: false, error: err.message });
  }
});

// Lista Pedidos iFood (Proxy)
router.get('/ifood/orders', async (req, res) => {
  try {
    const data = await ifoodService.listOrders();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erro ao buscar pedidos no iFood' });
  }
});

export default router;
