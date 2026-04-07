import express from 'express';
import { supabase } from '../../config/supabase.js';

const router = express.Router();

// GET /api/whatsapp/conversations
router.get('/conversations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('whatsapp_conversations')
      .select(`
        *,
        whatsapp_contacts (*)
      `)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/whatsapp/messages/:conversationId
router.get('/messages/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
