import express from 'express';
import { marketingController } from './marketing.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Campanhas WhatsApp
router.get('/campanhas', authenticate, marketingController.listCampanhas);
router.post('/campanhas', authenticate, marketingController.createCampanha);

// Cupons de Desconto
router.get('/cupons', authenticate, marketingController.listCupons);
router.post('/cupons', authenticate, marketingController.createCupom);
router.put('/cupons/:id/toggle', authenticate, marketingController.toggleCupom);

export default router;
