import express from 'express';
import { anotaaiController } from './anotaai.controller.js';
import { authenticate } from '../../../middlewares/auth.middleware.js';

const router = express.Router();

// Sincronização de catálogo Anota AI
router.post('/catalog/import', authenticate, anotaaiController.importCatalog);

export default router;
