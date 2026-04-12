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
import filiaisRoutes from '../modules/filiais/filiais.routes.js';
import marketingRoutes from '../modules/marketing/marketing.routes.js';
import { uploadComprovante } from '../middlewares/upload.middleware.js';
import ifoodRoutes from '../modules/integrations/ifood/ifood.routes.js';
import { handlePagarmeWebhook } from '../modules/integrations/pagarme/pagarme.webhook.js';
import pagarmeRoutes from '../modules/integrations/pagarme/pagarme.routes.js';
import anotaaiRoutes from '../modules/integrations/anotaai/anotaai.routes.js';

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
router.use('/filiais', filiaisRoutes);
router.use('/marketing', marketingRoutes);

/**
 * 🛒 MÓDULO: PRODUTOS (/api/products)
 */
router.use('/products', productsRoutes);

router.use('/orders', ordersRoutes);
router.use('/payments', paymentsRoutes);
router.use('/pagarme', pagarmeRoutes);

/**
 * 🤖 MÓDULO: WHATSAPP BOT (/api/whatsapp)
 */
router.use('/whatsapp', botRoutes);

/**
 * 📡 MÓDULO: INTEGRAÇÕES iFOOD (/api/ifood)
 */
router.use('/ifood', ifoodRoutes);

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
