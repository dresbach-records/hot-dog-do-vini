import api from '../api';

/**
 * iFood Service - Suíte Industrial (V2/V3)
 * Centraliza as chamadas à Merchant API via Proxy Backend.
 */
const ifoodService = {
  
  // --- STATUS & AUTH ---
  getStatus: () => api.get('/ifood/status'),
  authStart: () => api.post('/ifood/auth/start'),
  authConfirm: (code) => api.post('/ifood/auth/confirm', { code }),

  // --- PEDIDOS & LOGÍSTICA ---
  listOrders: () => api.get('/ifood/orders'),
  confirmOrder: (orderId) => api.post(`/ifood/orders/${orderId}/confirm`),
  dispatchOrder: (orderId) => api.post(`/ifood/orders/${orderId}/dispatch`),
  getOrderTracking: (orderId) => api.get(`/ifood/orders/${orderId}/tracking`),

  // --- SHIPPING (V2) ---
  checkShippingAvailability: (orderData) => api.post('/ifood/shipping/availabilities', { orderData }),
  requestDriver: (shippingData) => api.post('/ifood/shipping/request', { shippingData }),
  getShippingStatus: (deliveryId) => api.get(`/ifood/shipping/${deliveryId}`),

  // --- REPUTAÇÃO (REVIEWS V2) ---
  listReviews: (params) => api.get('/ifood/reviews', { params }),
  getReviewSummary: () => api.get('/ifood/reviews/summary'),
  answerReview: (reviewId, text) => api.post(`/ifood/reviews/${reviewId}/answers`, { text }),

  // --- FINANCEIRO (V3) ---
  getSales: (params) => api.get('/ifood/finance/sales', { params }),
  getFinancialEvents: (params) => api.get('/ifood/finance/events', { params }),
  getSettlements: (params) => api.get('/ifood/finance/settlements', { params }),
  getFinanceConsolidation: (params) => api.get('/ifood/finance/consolidation', { params }),

  // --- CATÁLOGO ---
  listCatalogs: () => api.get('/ifood/catalog'),
  importCatalog: (catalogData) => api.post('/ifood/catalog/import', { catalog: catalogData }),

  /**
   * Inicializa o iFood Widget para Chat e Tracking
   */
  initWidget: async (merchantIds) => {
    if (!window.iFoodWidget) {
      console.warn('[iFood Service] Widget script não carregado');
      return;
    }
    
    window.iFoodWidget.init({
      widgetId: '30d4c191-92a7-4e1a-b859-1e1ca9b2b803',
      merchantIds,
      autoShow: true
    });
    
    await window.iFoodWidget.ready;
    console.log('[iFood Service] Widget inicializado com sucesso');
  }
};

export default ifoodService;
