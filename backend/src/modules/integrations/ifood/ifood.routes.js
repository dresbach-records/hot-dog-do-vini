import express from 'express';
import { ifoodController } from './ifood.controller.js';

const router = express.Router();

/**
 * 🔐 AUTENTICAÇÃO
 */
router.post('/auth/start', ifoodController.startAuth);
router.post('/auth/confirm', ifoodController.confirmAuth);
router.get('/status', ifoodController.getStatus);

/**
 * 📦 PEDIDOS E OPERAÇÃO
 */
router.get('/orders', ifoodController.listOrders);
router.post('/orders/:orderId/confirm', ifoodController.confirmOrder);
router.post('/orders/:orderId/dispatch', ifoodController.dispatchOrder);
router.get('/orders/:orderId/tracking', ifoodController.getOrderTracking);

/**
 * 🚚 LOGÍSTICA & SHIPPING (V2)
 */
router.post('/shipping/availabilities', ifoodController.checkShippingAvailability);
router.post('/shipping/request', ifoodController.requestDriver);
router.get('/shipping/:deliveryId', ifoodController.getShippingStatus);

/**
 * ⭐️ REPUTAÇÃO (REVIEW V2)
 */
router.get('/reviews', ifoodController.listReviews);
router.get('/reviews/summary', ifoodController.getReviewSummary);
router.post('/reviews/:reviewId/answers', ifoodController.answerReview);

/**
 * 💰 FINANCEIRO (V3)
 */
router.get('/finance/sales', ifoodController.getSales);
router.get('/finance/events', ifoodController.getFinancialEvents);
router.get('/finance/settlements', ifoodController.getSettlements);
router.get('/finance/consolidation', ifoodController.getFinanceConsolidation);

/**
 * 🏬 CATÁLOGO
 */
router.get('/catalog', ifoodController.getCatalog);
router.post('/catalog/import', ifoodController.importCatalog);

/**
 * 📡 WEBHOOK (HMAC Security)
 */
router.post('/webhook', ifoodController.webhookHandler);

export default router;
