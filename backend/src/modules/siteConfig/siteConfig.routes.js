import { Router } from 'express';
import { getConfigs, updateConfig } from './siteConfig.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = Router();

// Publicly available for the landing portal
router.get('/', getConfigs);

// Admin only to update
router.post('/', authMiddleware, updateConfig);

export default router;
