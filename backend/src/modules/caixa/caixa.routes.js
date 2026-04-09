import { Router } from 'express';
import { caixaController } from './caixa.controller.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = Router();

// Todas as rotas de caixa exigem login
router.use(authMiddleware);

router.get('/sessao-ativa', caixaController.getActiveSession);
router.post('/abrir', caixaController.open);
router.post('/:id/fechar', caixaController.close);
router.get('/:id/resumo', caixaController.getResumo);

export default router;
