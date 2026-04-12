import express from 'express';
import { juridicoController } from './juridico.controller.js';

const router = express.Router();

// Templates
router.get('/templates', juridicoController.listTemplates);
router.post('/templates', juridicoController.createTemplate);
router.put('/templates/:id', juridicoController.updateTemplate);

// Contratos
router.get('/contracts', juridicoController.listContracts);
router.post('/contracts', juridicoController.generateContract);

// Documentos
router.get('/documents', juridicoController.listDocuments);
router.post('/documents', juridicoController.createDocument);

// Fiscal / Vendas Manuais
router.get('/fiscal-sales', juridicoController.listFiscalSales);
router.post('/fiscal-sales', juridicoController.createFiscalSale);

export default router;
