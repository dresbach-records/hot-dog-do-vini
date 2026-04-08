import express from 'express';
import { query } from '../../infrastructure/database.js';

const router = express.Router();

// GET /api/whatsapp/conversations
router.get('/conversations', async (req, res) => {
  try {
    const rows = await query(`
      SELECT 
        c.*, 
        ct.id as contact_uuid, ct.phone, ct.name, ct.pushname, ct.profile_pic_url, ct.tags, ct.segmento
      FROM whatsapp_conversations c
      JOIN whatsapp_contacts ct ON c.contact_id = ct.id
      ORDER BY c.last_message_at DESC
    `);

    // Mapear para o formato que o frontend espera (contato aninhado)
    const data = rows.map(row => ({
      ...row,
      whatsapp_contacts: {
        id: row.contact_uuid,
        phone: row.phone,
        name: row.name,
        pushname: row.pushname,
        profile_pic_url: row.profile_pic_url,
        tags: row.tags,
        segmento: row.segmento
      }
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/whatsapp/messages/:conversationId
router.get('/messages/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const data = await query(
      'SELECT * FROM whatsapp_messages WHERE conversation_id = ? ORDER BY created_at ASC',
      [conversationId]
    );

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/whatsapp/contacts/:id
router.put('/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Se tags for array, converte para string JSON para MySQL
    if (data.tags && Array.isArray(data.tags)) {
      data.tags = JSON.stringify(data.tags);
    }

    const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    await query(`UPDATE whatsapp_contacts SET ${sets} WHERE id = ?`, values);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

