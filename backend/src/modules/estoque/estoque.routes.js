import { Router } from 'express';
import { estoqueController } from './estoque.controller.js';

const router = Router();

// --- INSUMOS ---
router.get('/insumos', estoqueController.listInsumos);
router.post('/insumos', estoqueController.createInsumo);
router.post('/insumos/:id/movimentar', estoqueController.movimentar);

// --- RECEITAS ---
router.get('/receita/:id', estoqueController.getReceita);
router.post('/receita', estoqueController.saveReceita);

export default router;
