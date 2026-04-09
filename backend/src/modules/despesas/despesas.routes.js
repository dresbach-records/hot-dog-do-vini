import express from 'express';
import { despesasController } from './despesas.controller.js';

const router = express.Router();

router.get('/', despesasController.list);
router.post('/', despesasController.create);
router.put('/:id', despesasController.update);
router.delete('/:id', despesasController.delete);

export default router;
