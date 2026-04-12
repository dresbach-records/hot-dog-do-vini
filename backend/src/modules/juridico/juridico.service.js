import { query } from '../../config/database.js';
import crypto from 'node:crypto';

export const juridicoService = {
  // TEMPLATES
  async listTemplates() {
    return await query('SELECT * FROM contratos_templates ORDER BY created_at DESC');
  },

  async createTemplate(dados) {
    const id = crypto.randomUUID();
    await query(
      'INSERT INTO contratos_templates (id, nome, tipo, conteudo) VALUES (?, ?, ?, ?)',
      [id, dados.nome, dados.tipo, dados.conteudo]
    );
    return { success: true, id };
  },

  // CONTRATOS
  async listContracts() {
    return await query(`
      SELECT c.*, t.nome as template_nome 
      FROM contratos c 
      LEFT JOIN contratos_templates t ON c.template_id = t.id 
      ORDER BY c.created_at DESC
    `);
  },

  async generateContract(dados) {
    const id = crypto.randomUUID();
    
    // Buscar template
    const [template] = await query('SELECT * FROM contratos_templates WHERE id = ?', [dados.template_id]);
    if (!template) throw new Error('Template não encontrado');
    
    let conteudo = template.conteudo;

    // Substituição básica de variáveis
    if (dados.variaveis && typeof dados.variaveis === 'object') {
      Object.keys(dados.variaveis).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        conteudo = conteudo.replace(regex, dados.variaveis[key]);
      });
    }

    await query(
      'INSERT INTO contratos (id, template_id, nome_parte_B, documento_parte_B, status) VALUES (?, ?, ?, ?, ?)',
      [id, dados.template_id, dados.nome_parte_B, dados.documento_parte_B, 'rascunho']
    );

    return { success: true, id, conteudo };
  },

  // DOCUMENTOS
  async listDocuments() {
    return await query('SELECT * FROM documentos ORDER BY created_at DESC');
  },

  async createDocument(dados) {
    const id = crypto.randomUUID();
    await query(
      'INSERT INTO documentos (id, nome, tipo, url, data_vencimento) VALUES (?, ?, ?, ?, ?)',
      [id, dados.nome, dados.tipo, dados.url, dados.data_vencimento]
    );
    return { success: true, id };
  }
};
