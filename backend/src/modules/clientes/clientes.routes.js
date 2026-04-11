import express from 'express';
import { clientesService } from './clientes.service.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const data = await clientesService.list();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const data = await clientesService.create(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const data = await clientesService.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const data = await clientesService.delete(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
