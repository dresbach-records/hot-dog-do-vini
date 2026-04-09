import express from 'express';
import { motoboysController } from './motoboys.controller.js';

const router = express.Router();

router.get('/', motoboysController.list);
router.post('/', motoboysController.create);
router.put('/:id', motoboysController.update);
router.delete('/:id', motoboysController.delete);

export default router;
