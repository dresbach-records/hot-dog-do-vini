import { query } from '../../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const clientesService = {
  async list() {
    // Pegar clientes e seus pedidos relacionando via MariaDB
    const clientes = await query('SELECT * FROM clientes');
    const pedidos = await query('SELECT * FROM pedidos');

    return clientes.map(cliente => ({
      ...cliente,
      pedidos: pedidos.filter(p => p.cliente_id === cliente.id)
    }));
  },

  async getById(id) {
    const [cliente] = await query('SELECT * FROM clientes WHERE id = ?', [id]);
    if (!cliente) return null;
    const pedidos = await query('SELECT * FROM pedidos WHERE cliente_id = ?', [id]);
    const transacoes = await query('SELECT * FROM transacoes WHERE cliente_id = ? ORDER BY created_at DESC', [id]);
    return { ...cliente, pedidos, transacoes };
  },

  async create(data) {
    const id = data.id || uuidv4();
    const finalData = { ...data, id };
    const columns = Object.keys(finalData).join(', ');
    const placeholders = Object.keys(finalData).map(() => '?').join(', ');
    const values = Object.values(finalData);

    const sql = `INSERT INTO clientes (${columns}) VALUES (${placeholders})`;
    await query(sql, values);
    return this.getById(id);
  },

  async update(id, data) {
    const oldCliente = await this.getById(id);
    if (!oldCliente) throw new Error('Cliente não encontrado');

    const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    const sql = `UPDATE clientes SET ${sets} WHERE id = ?`;
    await query(sql, values);

    // Lógica de registro de transação se houver mudança financeira
    if (data.saldo_devedor !== undefined || data.total_pago !== undefined) {
      const diffSaldo = (data.saldo_devedor !== undefined) ? (data.saldo_devedor - oldCliente.saldo_devedor) : 0;
      const diffPago = (data.total_pago !== undefined) ? (data.total_pago - oldCliente.total_pago) : 0;

      if (diffSaldo !== 0 || diffPago !== 0) {
        let tipo = 'debito';
        let valor = Math.abs(diffSaldo || diffPago);
        let descricao = data.memo || 'Ajuste manual de saldo';

        if (diffSaldo < 0 || diffPago > 0) {
           tipo = 'credito';
        }

        await query(
          'INSERT INTO transacoes (id, cliente_id, tipo, valor, saldo_anterior, saldo_posterior, descricao) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [uuidv4(), id, tipo, valor, oldCliente.saldo_devedor, data.saldo_devedor || oldCliente.saldo_devedor, descricao]
        );
      }
    }

    return this.getById(id);
  },

  async getHistory(id) {
    return await query('SELECT * FROM transacoes WHERE cliente_id = ? ORDER BY created_at DESC', [id]);
  }
};
