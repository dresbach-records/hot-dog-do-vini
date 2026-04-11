import { Router } from 'express';
import { despesasController } from './despesas.controller.js';

const router = Router();

router.get('/', despesasController.list);
router.post('/', despesasController.create);
router.delete('/:id', despesasController.delete);

export default router;
