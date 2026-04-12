import { query } from '../../../config/database.js';
import crypto from 'node:crypto';

export const anotaaiService = {
  /**
   * Sincroniza catálogo do Anota AI para o MariaDB
   * Mapeando via anotaai_id
   */
  async importCatalog(data) {
    try {
      for (const cat of data) {
        // 1. Categoria
        let [categoria] = await query('SELECT id FROM categorias WHERE anotaai_id = ?', [cat.id]);
        let categoriaId;

        if (categoria) {
          categoriaId = categoria.id;
          await query('UPDATE categorias SET nome = ?, ativa = TRUE WHERE id = ?', [cat.name, categoriaId]);
        } else {
          categoriaId = crypto.randomUUID();
          await query('INSERT INTO categorias (id, nome, anotaai_id, ativa) VALUES (?, ?, ?, TRUE)', [categoriaId, cat.name, cat.id]);
        }

        // 2. Produtos
        for (const p of cat.items) {
          const [produto] = await query('SELECT id FROM produtos WHERE anotaai_id = ?', [p.id]);
          
          if (produto) {
            await query(
              'UPDATE produtos SET titulo = ?, descricao = ?, preco = ?, disponivel = ? WHERE id = ?',
              [p.name, p.description, p.price, true, produto.id]
            );
          } else {
            await query(
              'INSERT INTO produtos (id, categoria_id, titulo, descricao, preco, anotaai_id, disponivel) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [crypto.randomUUID(), categoriaId, p.name, p.description, p.price, p.id, true]
            );
          }
        }
      }
      return { success: true };
    } catch (error) {
      console.error('[AnotaAIService] Erro na importação:', error);
      throw error;
    }
  }
};
