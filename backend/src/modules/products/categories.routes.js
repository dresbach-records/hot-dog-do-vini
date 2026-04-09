import express from 'express';
import { categoriesController } from './categories.controller.js';

const router = express.Router();

router.get('/', categoriesController.list);
router.post('/', categoriesController.create);
router.put('/:id', categoriesController.update);
router.delete('/:id', categoriesController.delete);

export default router;
