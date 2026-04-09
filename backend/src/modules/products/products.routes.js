import express from 'express';
import { productsController } from './products.controller.js';

const router = express.Router();

router.get('/', productsController.list);
router.get('/active', productsController.listActive);
router.get('/:id', productsController.getById);
router.post('/', productsController.create);
router.put('/:id', productsController.update);
router.delete('/:id', productsController.delete);

export default router;
