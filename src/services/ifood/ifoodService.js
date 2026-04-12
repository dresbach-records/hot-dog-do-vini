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
    console.log(`[iFoodService] Solicitando busca real ao backend: ${merchantId}`);
    
    if (onProgress) onProgress(20, 'Consultando Merchant API...');
    
    try {
      const res = await api.get('/ifood/catalog/fetch');
      if (!res.success) throw new Error(res.error);
      
      if (onProgress) onProgress(80, 'Normalizando dados do marketplace...');
      return ifoodService.normalizar(res.data);
    } catch (error) {
      console.error('[iFoodService] Erro na busca real:', error);
      throw error;
    }
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
