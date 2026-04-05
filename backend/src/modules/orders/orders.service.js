import { supabase } from '../../config/supabase.js';

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
    // Evita pedidos duplicados por erro de clique do usuário
    const { data: recentOrders } = await supabase
      .from('pedidos')
      .select('id, created_at, itens')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentOrders && recentOrders.length > 0) {
      const lastOrder = recentOrders[0];
      const diffSeconds = (new Date() - new Date(lastOrder.created_at)) / 1000;
      
      // Compara se os itens são idênticos no intervalo de 30s
      if (diffSeconds < 30 && JSON.stringify(lastOrder.itens) === JSON.stringify(itens)) {
        console.warn(`[Idempotency] Pedido duplicado detectado para usuário ${user.id}. Ignorando.`);
        return { success: true, data: lastOrder, message: 'Pedido já processado recentemente.' };
      }
    }

    // 2. RECÁLCULO AUTORITÁRIO (SEGURANÇA DE PREÇO)
    // Buscamos os preços REAIS no banco de dados
    const itemIds = itens.map(i => i.id);
    const { data: dbProducts, error: dbError } = await supabase
      .from('produtos')
      .select('id, preco, titulo')
      .in('id', itemIds);

    if (dbError || !dbProducts) throw new Error('Falha ao validar produtos');

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

    // 3. PERSISTÊNCIA (SERVICE ROLE ACESSO TOTAL)
    const orderToSave = {
      usuario_id: user.id,
      cliente,
      itens: itensProcessados,
      total: totalGeral,
      endereco,
      pagamento,
      agendamento,
      status: 'pendente',
      created_at: new Date().toISOString()
    };

    const { data: newOrder, error: saveError } = await supabase
      .from('pedidos')
      .insert(orderToSave)
      .select()
      .single();

    if (saveError) {
      console.error('[Database Error]', saveError);
      throw new Error('Falha ao salvar pedido no banco de dados');
    }

    return { 
      success: true, 
      data: newOrder, 
      message: 'Pedido criado com sucesso e validado pelo servidor!' 
    };
  },

  /**
   * Listagem do Histórico do Usuário
   */
  async listByUser(userId) {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  }
};
