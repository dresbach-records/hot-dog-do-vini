import { Router } from 'express';
import { getConfigs, updateConfig } from './siteConfig.controller.js';
import { authenticate } from '../../middlewares/auth.js';

const router = Router();

// Publicly available for the landing portal
router.get('/', getConfigs);

// Admin only to update
router.post('/', authenticate, updateConfig);

export default router;
