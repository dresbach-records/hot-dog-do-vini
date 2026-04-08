import express from 'express';
import ordersRoutes from '../modules/orders/orders.routes.js';
import productsRoutes from '../modules/products/products.routes.js';
import paymentsRoutes from './payments.routes.js';
import botRoutes from '../modules/bot/bot.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import clientesRoutes from '../modules/clientes/clientes.routes.js';
import cuponsRoutes from '../modules/cupons/cupons.routes.js';
import { ifoodService } from '../modules/integrations/ifood/ifood.service.js';

const router = express.Router();

/**
 * 🛒 MÓDULO: PRODUTOS (/api/products)
 */
router.use('/auth', authRoutes);
router.use('/clientes', clientesRoutes);
router.use('/cupons', cuponsRoutes);

/**
 * 🛒 MÓDULO: PRODUTOS (/api/products)
 */
router.use('/products', productsRoutes);

router.use('/orders', ordersRoutes);

router.use('/payments', paymentsRoutes);

/**
 * 🤖 MÓDULO: WHATSAPP BOT (/api/whatsapp)
 */
router.use('/whatsapp', botRoutes);

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

// WEBHOOK IFOOD: Recebe eventos de novos pedidos e mudanças de status
router.post('/ifood/webhook', async (req, res) => {
  try {
    const events = req.body;
    console.log('[iFood Webhook] Eventos recebidos:', events);
    // TODO: Processar eventos (Confirmar, Cancelar, etc) e atualizar no banco
    res.status(200).send();
  } catch (err) {
    console.error('[iFood Webhook Error]', err);
    res.status(500).send();
  }
});

// IMPRESSÃO LOCAL: Dispara o agente de impressão
router.post('/print', async (req, res) => {
  try {
    const { content, type } = req.body;
    console.log('[Print Service] Solicitando impressão:', { type });

    // TODO: Chamar o executável da GP iFood ou enviar comando via Raw Print
    // C:\Program Files (x86)\Impressora GP iFood
    
    res.json({ success: true, message: 'Impressão enviada com sucesso!' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Falha ao disparar impressão local' });
  }
});

export default router;
