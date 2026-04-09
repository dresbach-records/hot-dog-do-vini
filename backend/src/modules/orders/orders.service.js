import { query } from '../../config/database.js';
import { asaasService } from '../integrations/asaas/asaas.service.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Orders Service — Lógica de Negócio (Nível 10/10)
 * Recálculo, Idempotência e Persistência
 */
export const ordersService = {
  
  /**
   * Criação de Novo Pedido (Zero Trust)
   */
  async create(data, user) {
    const { itens, cliente, endereco, pagamento, agendamento } = data;

    // 1. BARREIRA DE IDEMPOTÊNCIA (30 SEGUNDOS)
    const recentOrders = await query(
      'SELECT id, created_at, itens FROM pedidos WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [user.id]
    );

    if (recentOrders && recentOrders.length > 0) {
      const lastOrder = recentOrders[0];
      const diffSeconds = (new Date() - new Date(lastOrder.created_at)) / 1000;
      
      if (diffSeconds < 30 && JSON.stringify(lastOrder.itens) === JSON.stringify(itens)) {
        console.warn(`[Idempotency] Pedido duplicado detectado para usuário ${user.id}. Ignorando.`);
        return { success: true, data: lastOrder, message: 'Pedido já processado recentemente.' };
      }
    }

    // 2. RECÁLCULO AUTORITÁRIO
    const itemIds = itens.map(i => i.id);
    const dbProducts = await query(
      'SELECT id, preco, titulo FROM produtos WHERE id IN (?)',
      [itemIds]
    );

    if (!dbProducts || dbProducts.length === 0) throw new Error('Falha ao validar produtos');

    let totalGeral = 0;
    const itensProcessados = itens.map(item => {
      const product = dbProducts.find(p => p.id === item.id);
      if (!product) throw new Error(`Produto ${item.id} não encontrado ou inativo`);
      
      const subtotal = Number(product.preco) * item.quantidade;
      totalGeral += subtotal;

      return {
        ...item,
        titulo: product.titulo,
        preco_unitario: product.preco,
        subtotal
      };
    });

    // 3. PERSISTÊNCIA
    const orderId = uuidv4();
    const orderToSave = [
      orderId,
      user.id,
      data.cliente_id || null, // Link to clients table if provided
      JSON.stringify(itensProcessados),
      totalGeral,
      JSON.stringify(endereco),
      pagamento.metodo,
      'pendente',
      new Date()
    ];

    await query(
      'INSERT INTO pedidos (id, user_id, cliente_id, itens, total, endereco_entrega, forma_pagamento, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      orderToSave
    );

    // Fetch the new order
    const [newOrder] = await query('SELECT * FROM pedidos WHERE id = ?', [orderId]);

    // 4. INTEGRAÇÃO FINANCEIRA (ASAAS)
    let paymentData = null;
    if (pagamento.metodo?.startsWith('asaas_')) {
       try {
          const type = pagamento.metodo.replace('asaas_', '').toUpperCase(); 
          
          paymentData = await asaasService.createPayment({
            asaasCustomerId: cliente?.asaas_customer_id, 
            valor: totalGeral,
            metodo: type,
            pedidoId: orderId,
            descricao: `Pedido #${orderId.substring(0,8)}`
          });

          await query(
            'UPDATE pedidos SET asaas_payment_id = ? WHERE id = ?',
            [paymentData.id, orderId]
          );

       } catch (err) {
          console.error('[Asaas Service Error]', err.message);
       }
    }

    return { 
      success: true, 
      data: { ...newOrder, asaas: paymentData }, 
      message: 'Pedido criado com sucesso!' 
    };
  },

  /**
   * Atualizar Pedido
   */
  async update(id, data) {
    const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    
    await query(`UPDATE pedidos SET ${sets} WHERE id = ?`, values);
    const [updated] = await query('SELECT * FROM pedidos WHERE id = ?', [id]);
    return updated;
  },

  /**
   * Listagem do Histórico do Usuário
   */
  async listByUser(userId) {
    const data = await query(
      'SELECT * FROM pedidos WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return { success: true, data };
  }
};
