import express from 'express';
import { dashboardController } from './dashboard.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/stats', authMiddleware, dashboardController.getStats);
router.get('/charts', authMiddleware, dashboardController.getCharts);

export default router;
