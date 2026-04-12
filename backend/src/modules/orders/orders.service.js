import { query } from '../../config/database.js';
import { asaasService } from '../integrations/asaas/asaas.service.js';
import { focusnfeService } from '../integrations/focusnfe/focusnfe.service.js';
import { botService } from '../bot/bot.service.js';
import crypto from 'node:crypto';

/**
 * Orders Service — Lógica Operacional Profissional
 */
export const ordersService = {
  
  async create(data, user) {
    const { 
      itens, 
      cliente_id, 
      endereco, 
      pagamentos, // Array: [{metodo, valor}]
      agendamento,
      origem_venda = 'portal',
      sessao_id = null 
    } = data;

    let conn;
    try {
      conn = await db.getConnection();
      await conn.beginTransaction();

      // 1. BARREIRA DE IDEMPOTÊNCIA (Dentro da transação para lock)
      const [recentOrders] = await conn.execute(
        'SELECT id, created_at FROM pedidos WHERE user_id = ? ORDER BY created_at DESC LIMIT 1 FOR UPDATE',
        [user.id]
      );

      if (recentOrders && recentOrders.length > 0) {
        const diffSeconds = (new Date() - new Date(recentOrders[0].created_at)) / 1000;
        if (diffSeconds < 5) {
          throw new Error('Processando pedido... aguarde alguns segundos.');
        }
      }

      // 2. RECÁLCULO TOTAL (Zero Trust) e VALIDAÇÃO DE ESTOQUE
      let totalGeral = 0;
      const itensProcessados = [];

      for (const item of itens) {
        const [products] = await conn.execute('SELECT preco, titulo FROM produtos WHERE id = ? FOR UPDATE', [item.id]);
        const product = products[0];
        if (!product) throw new Error(`Produto ${item.id} não encontrado`);

        let precoBase = Number(product.preco);
        
        // Adiciona preço da variação
        if (item.selectedVariacao) {
          const [variacoes] = await conn.execute('SELECT preco_adicional FROM produto_variacoes WHERE id = ?', [item.selectedVariacao.id]);
          if (variacoes[0]) precoBase += Number(variacoes[0].preco_adicional);
        }

        // Adiciona preço dos adicionais
        if (item.selectedAdicionais?.length > 0) {
          const adicIds = item.selectedAdicionais.map(a => a.id);
          const [adicionais] = await conn.execute(`SELECT SUM(preco) as extra FROM produto_adicionais WHERE id IN (${adicIds.join(',')})`);
          if (adicionais[0].extra) precoBase += Number(adicionais[0].extra);
        }

        const subtotal = precoBase * item.quantidade;
        totalGeral += subtotal;

        itensProcessados.push({
          ...item,
          titulo: product.titulo,
          preco_unitario: precoBase,
          subtotal
        });

        // 📦 NOVA VALIDAÇÃO CRÍTICA DE ESTOQUE (LOCK)
        const [insumosNecessarios] = await conn.execute(
          'SELECT insumo_id, quantidade_necessaria FROM produto_insumos WHERE produto_id = ?',
          [item.id]
        );

        for (const rec of insumosNecessarios) {
          const [insumos] = await conn.execute(
            'SELECT nome, quantidade FROM insumos WHERE id = ? FOR UPDATE',
            [rec.insumo_id]
          );
          const insumo = insumos[0];

          const qtdTotalBaixa = Number(rec.quantidade_necessaria) * Number(item.quantidade);
          
          if (insumo.quantidade < qtdTotalBaixa) {
            throw new Error(`Estoque insuficiente para o insumo: ${insumo.nome}. Disponível: ${insumo.quantidade}`);
          }

          // Realiza a baixa
          await conn.execute(
            'UPDATE insumos SET quantidade = quantidade - ? WHERE id = ?',
            [qtdTotalBaixa, rec.insumo_id]
          );

          // Log de movimentação de estoque
          await conn.execute(
            'INSERT INTO estoque_movimentacoes (id, insumo_id, tipo, quantidade, observacao) VALUES (?, ?, ?, ?, ?)',
            [crypto.randomUUID(), rec.insumo_id, 'saida', qtdTotalBaixa, `Venda: Pedido Base`]
          );
        }
      }

      // 3. PERSISTÊNCIA DO PEDIDO
      const orderId = crypto.randomUUID();
      await conn.execute(
        `INSERT INTO pedidos (
          id, user_id, cliente_id, sessao_id, itens, total, 
          endereco_entrega, forma_pagamento, status, created_at, agendado_para
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId, 
          user.id, 
          cliente_id || null, 
          sessao_id || null,
          JSON.stringify(itensProcessados), 
          totalGeral,
          JSON.stringify(endereco || {}),
          pagamentos && pagamentos.length > 0 ? pagamentos[0].metodo : 'pendente',
          'pendente',
          new Date(),
          agendamento ? new Date(agendamento) : null
        ]
      );

      // 4. REGISTRO DE PAGAMENTOS & CAIXA
      if (pagamentos && pagamentos.length > 0) {
        for (const p of pagamentos) {
          const pagId = crypto.randomUUID();
          await conn.execute(
            'INSERT INTO pedido_pagamentos (id, pedido_id, metodo, valor, status, pago_em) VALUES (?, ?, ?, ?, ?, ?)',
            [pagId, orderId, p.metodo, p.valor, 'pago', new Date()]
          );

          await conn.execute(
            'INSERT INTO caixa_movimentacoes (id, tipo, valor, origem, pedido_id) VALUES (?, ?, ?, ?, ?)',
            [crypto.randomUUID(), 'entrada', p.valor, `Venda: Pedido #${orderId.substring(0, 5)}`, orderId]
          );
        }
      }

      await conn.commit();
      
      return { 
        success: true, 
        id: orderId,
        total: totalGeral,
        message: 'Pedido registrado com sucesso e estoque atualizado!' 
      };
    } catch (error) {
      if (conn) await conn.rollback();
      throw error;
    } finally {
      if (conn) conn.release();
    }
  },

  async updateStatus(id, status, userId) {
    await query('UPDATE pedidos SET status = ?, status_entrega = ? WHERE id = ?', [status, status === 'em_rota' ? 'em_rota' : 'concluido', id]);
    
    // Log de Auditoria
    await query(
      'INSERT INTO system_logs (user_id, acao, modulo, dados_novos) VALUES (?, ?, ?, ?)',
      [userId, `Alterou status para ${status}`, 'pedidos', JSON.stringify({ pedido_id: id })]
    );
    
    // 🏷️ GATILHO FISCAL: Emissão Automática de NFC-e
    if (status === 'pago') {
       focusnfeService.emitirNFCe(id).catch(err => console.error('[Fatal Fiscal Hook]', err));
    }

    // 🤖 GATILHO WHATSAPP: Notificar Cliente
    try {
      const [orderData] = await query(`
         SELECT p.id, c.nome, c.telefone 
         FROM pedidos p 
         LEFT JOIN clientes c ON p.cliente_id = c.id 
         WHERE p.id = ?`, 
         [id]
      );
      
      if (orderData && orderData.telefone) {
         botService.sendOrderUpdate(orderData.telefone, id, status);
      }
    } catch (waErr) {
      console.error('[WhatsApp Trigger Error]', waErr.message);
    }

    return { success: true, status };
  },

  async despachar(id, motoboyId, userId) {
    await query(
      'UPDATE pedidos SET status = "em_rota", status_entrega = "em_rota", motoboy_id = ? WHERE id = ?',
      [motoboyId, id]
    );

    await query(
      'INSERT INTO system_logs (user_id, acao, modulo, dados_novos) VALUES (?, ?, ?, ?)',
      [userId, `Despachou pedido com motoboy ${motoboyId}`, 'logistica', JSON.stringify({ pedido_id: id, motoboy_id: motoboyId })]
    );

    // 🤖 GATILHO WHATSAPP: Notificar Saída para Entrega
    try {
      const [data] = await query(`
        SELECT p.id, c.telefone, f.nome as motoboy_nome 
        FROM pedidos p 
        LEFT JOIN clientes c ON p.cliente_id = c.id 
        LEFT JOIN funcionarios f ON p.motoboy_id = f.id 
        WHERE p.id = ?`, 
        [id]
      );

      if (data && data.telefone) {
        botService.sendOrderUpdate(data.telefone, id, 'em_rota', { motoboy: data.motoboy_nome });
      }
    } catch (waErr) {
       console.error('[WhatsApp Dispatch Trigger Error]', waErr.message);
    }

    return { success: true };
  },

  async listAll() {
    return await query(`
      SELECT p.*, c.nome as cliente_nome, u.nome as operator_nome, f.nome as motoboy_nome 
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN funcionarios f ON p.motoboy_id = f.id
      ORDER BY p.created_at DESC
    `);
  }
};

