import express from 'express';
import { ordersController } from './orders.controller.js';

const router = express.Router();

router.get('/', ordersController.list);
router.get('/all', ordersController.listAll);
router.get('/:id', ordersController.getById);
router.post('/', ordersController.create);
router.put('/:id/status', ordersController.updateStatus);
router.post('/:id/despachar', ordersController.despachar);
router.delete('/:id', ordersController.delete);

export default router;
