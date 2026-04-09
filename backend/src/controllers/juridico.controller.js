import { db } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const juridicoController = {
  // --- TEMPLATES ---
  async listTemplates(req, res) {
    try {
      const [rows] = await db.query('SELECT * FROM contract_templates ORDER BY created_at DESC');
      res.json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createTemplate(req, res) {
    const { nome, tipo, conteudo } = req.body;
    try {
      const [result] = await db.query(
        'INSERT INTO contract_templates (nome, tipo, conteudo) VALUES (?, ?, ?)',
        [nome, tipo, conteudo]
      );
      res.json({ success: true, id: result.insertId });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async updateTemplate(req, res) {
    const { id } = req.params;
    const { nome, tipo, conteudo } = req.body;
    try {
      await db.query(
        'UPDATE contract_templates SET nome = ?, tipo = ?, conteudo = ? WHERE id = ?',
        [nome, tipo, conteudo, id]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // --- CONTRATOS ---
  async listContracts(req, res) {
    try {
      const [rows] = await db.query(`
        SELECT c.*, t.nome as template_nome 
        FROM contracts c 
        LEFT JOIN contract_templates t ON c.template_id = t.id 
        ORDER BY c.created_at DESC
      `);
      res.json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async generateContract(req, res) {
    const { template_id, tipo, cliente_id, entregador_id, nome_parte_B, documento_parte_B, variaveis } = req.body;
    const id = uuidv4();
    try {
      // Buscar template
      const [templates] = await db.query('SELECT * FROM contract_templates WHERE id = ?', [template_id]);
      if (templates.length === 0) return res.status(404).json({ success: false, error: 'Template não encontrado' });
      
      let conteudo = templates[0].conteudo;

      // Substituição básica de variáveis (Ex: {{nome}})
      if (variaveis && typeof variaveis === 'object') {
        Object.keys(variaveis).forEach(key => {
          const regex = new RegExp(`{{${key}}}`, 'g');
          conteudo = conteudo.replace(regex, variaveis[key]);
        });
      }

      await db.query(
        `INSERT INTO contracts (id, template_id, tipo, cliente_id, entregador_id, nome_parte_B, documento_parte_B, conteudo_gerado) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, template_id, tipo, cliente_id, entregador_id, nome_parte_B, documento_parte_B, conteudo]
      );

      res.json({ success: true, id, conteudo });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async updateContractStatus(req, res) {
    const { id } = req.params;
    const { status, data_assinatura } = req.body;
    try {
      await db.query(
        'UPDATE contracts SET status = ?, data_assinatura = ? WHERE id = ?',
        [status, data_assinatura, id]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // --- DOCUMENTOS ---
  async listDocuments(req, res) {
    try {
      const [rows] = await db.query('SELECT * FROM company_documents ORDER BY created_at DESC');
      res.json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async createDocument(req, res) {
    const { nome, tipo, file_path, data_vencimento } = req.body;
    try {
      const [result] = await db.query(
        'INSERT INTO company_documents (nome, tipo, file_path, data_vencimento) VALUES (?, ?, ?, ?)',
        [nome, tipo, file_path, data_vencimento]
      );
      res.json({ success: true, id: result.insertId });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
