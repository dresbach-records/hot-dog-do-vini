import { query } from '../../config/database.js';
import crypto from 'node:crypto';

export const marketingService = {
  // CAMPANHAS
  async listCampanhas() {
    return await query('SELECT * FROM campanhas ORDER BY created_at DESC');
  },

  async createCampanha(dados) {
    const id = crypto.randomUUID();
    await query(
      'INSERT INTO campanhas (id, nome, mensagem, status, alcancados, cliques) VALUES (?, ?, ?, ?, ?, ?)',
      [id, dados.nome, dados.mensagem, 'agendado', 0, 0]
    );
    return { success: true, id };
  },

  // CUPONS
  async listCupons() {
    return await query('SELECT * FROM cupons ORDER BY code ASC');
  },

  async createCupom(dados) {
    const id = crypto.randomUUID();
    await query(
      'INSERT INTO cupons (id, code, description, discount_type, discount_value, active) VALUES (?, ?, ?, ?, ?, ?)',
      [id, dados.code, dados.description, dados.discount_type, dados.discount_value, true]
    );
    return { success: true, id };
  },

  async toggleCupom(id, active) {
    await query('UPDATE cupons SET active = ? WHERE id = ?', [active, id]);
    return { success: true };
  }
};
