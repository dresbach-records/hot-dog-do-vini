import { supabase } from '../../lib/supabaseClient';

/**
 * iFood Service - Lógica de Importação e Normalização
 * Responsável por conectar à API do iFood e converter para o padrão Vini's.
 */
const ifoodService = {
  
  /**
   * Busca o cardápio do iFood (Simulado para teste)
   * Em produção: Chama a API do iFood via Merchant ID / Auth Token
   */
  buscarCardapio: async (merchantId, onProgress) => {
    console.log(`[iFoodService] Buscando cardápio para o lojista: ${merchantId}`);
    
    if (onProgress) onProgress(10, 'Conectando ao iFood...');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (onProgress) onProgress(30, 'Autenticando...');
    await new Promise(resolve => setTimeout(resolve, 600));

    if (onProgress) onProgress(60, 'Baixando categorias e produtos...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock de dados retornados pelo iFood
    const rawData = [
      {
        id: 'cat_001',
        name: 'Hot Dogs Tradicionais',
        items: [
          { id: 'p_001', name: 'Dog Simples', description: 'Pão, salsicha, tomate e maio.', price: 18.50, image: 'https://placehold.co/600x400/png' },
          { id: 'p_002', name: 'Dog Duplo', description: '2 Salsichas e molho especial.', price: 23.90, image: 'https://placehold.co/600x400/png' }
        ]
      },
      {
        id: 'cat_002',
        name: 'Bebidas Geladas',
        items: [
          { id: 'p_003', name: 'Coca Cola 350ml', description: 'Lata gelada.', price: 7.00, image: 'https://placehold.co/600x400/png' }
        ]
      }
    ];

    if (onProgress) onProgress(90, 'Normalizando dados para o sistema Vini...');
    await new Promise(resolve => setTimeout(resolve, 600));

    return ifoodService.normalizar(rawData);
  },

  /**
   * Converte a estrutura do iFood para o padrão do Banco de Dados Vini's
   */
  normalizar: (data) => {
    return data.map(category => ({
      nome: category.name,
      ifood_id: category.id,
      produtos: category.items.map(product => ({
        titulo: product.name,
        descricao: product.description,
        preco: product.price,
        imagem_url: product.image,
        ifood_id: product.id,
        disponivel: true
      }))
    }));
  },

  /**
   * Grava os dados normalizados do iFood no Supabase
   */
  confirmarImportacao: async (viniData) => {
    try {
      for (const cat of viniData) {
        // 1. Inserir ou Atualizar Categoria
        const { data: categoria, error: catError } = await supabase
          .from('categorias')
          .upsert({ 
            nome: cat.nome, 
            ifood_id: cat.ifood_id,
            ativa: true 
          }, { onConflict: 'ifood_id' })
          .select()
          .single();

        if (catError) throw catError;

        // 2. Inserir Produtos da Categoria
        const productsToInsert = cat.produtos.map(p => ({
          ...p,
          categoria_id: categoria.id
        }));

        const { error: prodError } = await supabase
          .from('produtos')
          .upsert(productsToInsert, { onConflict: 'ifood_id' });

        if (prodError) throw prodError;
      }
      return { success: true };
    } catch (error) {
      console.error('[iFoodService] Erro ao salvar importação:', error);
      return { success: false, error };
    }
  }
};

export default ifoodService;
