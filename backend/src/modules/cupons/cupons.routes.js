import express from 'express';
import { query } from '../../config/database.js';

const router = express.Router();

// GET /api/cupons
router.get('/', async (req, res) => {
  try {
    const data = await query(
      'SELECT * FROM cupons WHERE ativo = 1 AND (validade IS NULL OR validade > NOW())'
    );
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
