import { query } from '../../config/database.js';

export const productsService = {
  async list() {
    const products = await query('SELECT p.*, c.nome as categoria_nome FROM produtos p LEFT JOIN categorias c ON p.categoria_id = c.id ORDER BY c.ordem, p.titulo');
    
    // Para cada produto, buscar variações e adicionais (Otimizado seria um JOIN, mas aqui simplificamos a lógica profissional)
    return Promise.all(products.map(async (p) => {
      const variacoes = await query('SELECT * FROM produto_variacoes WHERE produto_id = ?', [p.id]);
      const adicionais = await query('SELECT * FROM produto_adicionais WHERE produto_id = ?', [p.id]);
      return { ...p, variacoes, adicionais };
    }));
  },

  async listActive() {
    const products = await query('SELECT p.*, c.nome as categoria_nome FROM produtos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.disponivel = 1 ORDER BY c.ordem, p.titulo');
    return Promise.all(products.map(async (p) => {
      const variacoes = await query('SELECT * FROM produto_variacoes WHERE produto_id = ?', [p.id]);
      const adicionais = await query('SELECT * FROM produto_adicionais WHERE produto_id = ?', [p.id]);
      return { ...p, variacoes, adicionais };
    }));
  },

  async getById(id) {
    const [product] = await query('SELECT p.*, c.nome as categoria_nome FROM produtos p LEFT JOIN categorias c ON p.categoria_id = c.id WHERE p.id = ?', [id]);
    if (!product) return null;

    const variacoes = await query('SELECT * FROM produto_variacoes WHERE produto_id = ?', [id]);
    const adicionais = await query('SELECT * FROM produto_adicionais WHERE produto_id = ?', [id]);

    return { ...product, variacoes, adicionais };
  },

  async create(data) {
    const { variacoes, adicionais, ...productData } = data;
    const columns = Object.keys(productData).join(', ');
    const placeholders = Object.keys(productData).map(() => '?').join(', ');
    const values = Object.values(productData);

    const result = await query(`INSERT INTO produtos (${columns}) VALUES (${placeholders})`, values);
    const productId = data.id || result.insertId;

    // TODO: Implementar salvamento de variações e adicionais se fornecidos no create
    
    return this.getById(productId);
  },

  async update(id, data) {
    const { variacoes, adicionais, ...productData } = data;
    
    if (Object.keys(productData).length > 0) {
      const sets = Object.keys(productData).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(productData), id];
      await query(`UPDATE produtos SET ${sets} WHERE id = ?`, values);
    }

    return this.getById(id);
  },

  async delete(id) {
    await query('DELETE FROM produtos WHERE id = ?', [id]);
    return { success: true };
  }

};

export const categoriesService = {
  async list() {
    return await query('SELECT * FROM categorias ORDER BY ordem');
  },

  async create(data) {
    const result = await query('INSERT INTO categorias (nome, ordem) VALUES (?, ?)', [data.nome, data.ordem || 0]);
    return { id: result.insertId, ...data };
  },

  async update(id, data) {
    const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    await query(`UPDATE categorias SET ${sets} WHERE id = ?`, values);
    return { id, ...data };
  },

  async delete(id) {
     await query('DELETE FROM categorias WHERE id = ?', [id]);
     return { success: true };
  }
};
