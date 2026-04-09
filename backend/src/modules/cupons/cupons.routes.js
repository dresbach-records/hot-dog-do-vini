import express from 'express';
import { cuponsController } from './cupons.controller.js';

const router = express.Router();

router.get('/', cuponsController.list);
router.post('/validate', cuponsController.validate);
router.post('/', cuponsController.create);
router.delete('/:id', cuponsController.delete);

export default router;
