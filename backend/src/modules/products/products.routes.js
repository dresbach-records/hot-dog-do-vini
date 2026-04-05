import express from 'express';
import { supabase } from '../../config/supabase.js';

const router = express.Router();

/**
 * GET /api/products
 * Lista produtos ativos do catálogo
 */
router.get('/', async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('disponivel', true)
      .order('titulo');

    if (error) throw error;

    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erro ao buscar catálogo' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const { data: product, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(404).json({ success: false, error: 'Produto não encontrado' });

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Erro ao buscar detalhes do produto' });
  }
});

export default router;
