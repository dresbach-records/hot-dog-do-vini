import express from 'express';
import { productsService, categoriesService } from './products.service.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * 🛒 MÓDULO: CATEGORIAS (/api/products/categories)
 */
router.get('/categories', async (req, res) => {
  try {
    const data = await categoriesService.list();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/categories', authMiddleware, async (req, res) => {
  try {
    const data = await categoriesService.create(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/categories/:id', authMiddleware, async (req, res) => {
  try {
    await categoriesService.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 🛒 MÓDULO: PRODUTOS (/api/products)
 */
router.get('/', async (req, res) => {
  try {
    const data = await productsService.list();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/active', async (req, res) => {
  try {
    const data = await productsService.listActive();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const data = await productsService.create(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const data = await productsService.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await productsService.delete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
