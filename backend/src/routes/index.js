import express from 'express';
import ordersRoutes from '../modules/orders/orders.routes.js';
import productsRoutes from '../modules/products/products.routes.js';
import paymentsRoutes from './payments.routes.js';
import botRoutes from '../modules/bot/bot.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import clientesRoutes from '../modules/clientes/clientes.routes.js';
import cuponsRoutes from '../modules/cupons/cupons.routes.js';
import dashboardRoutes from '../modules/dashboard/dashboard.routes.js';
import motoboysRoutes from '../modules/motoboys/motoboys.routes.js';
import categoriesRoutes from '../modules/products/categories.routes.js';
import despesasRoutes from '../modules/despesas/despesas.routes.js';
import caixaRoutes from '../modules/caixa/caixa.routes.js';
import siteConfigRoutes from '../modules/siteConfig/siteConfig.routes.js';
import juridicoRoutes from '../modules/juridico/juridico.routes.js';
import fiscalRoutes from '../modules/fiscal/fiscal.routes.js';
import rhRoutes from '../modules/rh/rh.routes.js';
import estoqueRoutes from '../modules/estoque/estoque.routes.js';
import { ifoodController } from '../modules/integrations/ifood/ifood.controller.js';
import { uploadComprovante } from '../middlewares/upload.middleware.js';
import { handlePagarmeWebhook } from '../modules/integrations/pagarme/pagarme.webhook.js';

const router = express.Router();

/**
 * 📡 INTEGRAÇÃO: Pagar.me (Stone)
 */
// Webhook precisa do corpo bruto para validar assinatura
router.post('/pagarme/webhook', express.raw({ type: 'application/json' }), handlePagarmeWebhook);

/**
 * 📡 UPLOAD: Comprovantes PIX
 */
router.post('/upload/comprovante', uploadComprovante.single('comprovante'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Arquivo não enviado' });
  }
  
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/comprovantes/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

/**
 * 🛒 MÓDULO: PRODUTOS (/api/products)
 */
router.use('/auth', authRoutes);
router.use('/clientes', clientesRoutes);
router.use('/cupons', cuponsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/motoboys', motoboysRoutes);
router.use('/categories', categoriesRoutes);
router.use('/despesas', despesasRoutes);
router.use('/caixa', caixaRoutes);
router.use('/config', siteConfigRoutes);
router.use('/juridico', juridicoRoutes);
router.use('/fiscal', fiscalRoutes);
router.use('/rh', rhRoutes);
router.use('/estoque', estoqueRoutes);

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
router.post('/ifood/auth/start', ifoodController.startAuth);

// Login iFood: Confirma
router.post('/ifood/auth/confirm', ifoodController.confirmAuth);

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

// Importação de Cardápio para MariaDB
router.post('/ifood/catalog/import', ifoodController.importCatalog);

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

// ROTA DE SAÚDE (Health Check para Docker)
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;
