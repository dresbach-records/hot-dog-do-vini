import express from 'express';
import { filiaisController } from './filiais.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, filiaisController.list);
router.post('/', authenticate, filiaisController.create);
router.put('/:id', authenticate, filiaisController.update);
router.delete('/:id', authenticate, filiaisController.delete);

export default router;
