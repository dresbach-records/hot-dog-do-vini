import api from '../api';

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
   * Grava os dados normalizados do iFood no MariaDB (via Backend API)
   */
  confirmarImportacao: async (viniData) => {
    try {
      console.log('[iFoodService] Solicitando importação ao Backend MariaDB...');
      
      const response = await api.post('/ifood/catalog/import', {
        catalog: viniData
      });

      if (!response.success) {
        throw new Error(response.error || 'Erro desconhecido na importação');
      }

      return { success: true };
    } catch (error) {
      console.error('[iFoodService] Erro ao salvar importação:', error);
      return { success: false, error: error.message };
    }
  }
};

export default ifoodService;
