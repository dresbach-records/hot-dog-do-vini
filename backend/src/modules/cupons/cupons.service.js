import { query } from '../../config/database.js';

export const cuponsService = {
  async list() {
    return await query('SELECT * FROM cupons ORDER BY created_at DESC');
  },

  async getByCode(codigo) {
    const [coupon] = await query('SELECT * FROM cupons WHERE codigo = ? AND ativo = 1', [codigo]);
    return coupon;
  },

  async validate(codigo, totalPedido) {
    const coupon = await this.getByCode(codigo);
    
    if (!coupon) throw new Error('Cupom inválido ou expirado');
    
    if (coupon.valor_minimo && totalPedido < coupon.valor_minimo) {
      throw new Error(`O valor mínimo para este cupom é R$ ${coupon.valor_minimo}`);
    }

    let desconto = 0;
    if (coupon.tipo === 'percentual') {
      desconto = (totalPedido * coupon.valor) / 100;
    } else {
      desconto = coupon.valor;
    }

    return { 
      id: coupon.id,
      codigo: coupon.codigo,
      desconto: Math.min(desconto, totalPedido) 
    };
  },

  async create(data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    const result = await query(`INSERT INTO cupons (${columns}) VALUES (${placeholders})`, values);
    return { id: result.insertId, ...data };
  },

  async delete(id) {
    await query('DELETE FROM cupons WHERE id = ?', [id]);
    return { success: true };
  }
};
