import express from 'express';
import { juridicoController } from '../controllers/juridico.controller.js';

const router = express.Router();

// Templates
router.get('/templates', juridicoController.listTemplates);
router.post('/templates', juridicoController.createTemplate);
router.put('/templates/:id', juridicoController.updateTemplate);

// Contratos
router.get('/contratos', juridicoController.listContracts);
router.post('/contratos/gerar', juridicoController.generateContract);
router.patch('/contratos/:id/status', juridicoController.updateContractStatus);

// Documentos
router.get('/documentos', juridicoController.listDocuments);
router.post('/documentos', juridicoController.createDocument);

export default router;
