/**
 * ifoodService.js — Serviço de integração iFood API
 * Todas as chamadas passam pelo proxy Express em /api/ifood
 * Vini's ERP
 */

const BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

async function apiCall(endpoint, method = 'GET', body = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, opts);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Erro ${res.status}`);
  }
  
  return res.json();
}

// ==================== AUTENTICAÇÃO ====================

/**
 * Inicia o fluxo OAuth iFood — gera userCode para autorização no portal iFood
 * @returns {{ userCode: string, verificationUrl: string, verificationUrlComplete: string, expiresIn: number }}
 */
export async function iniciarAutorizacaoIfood() {
  return apiCall('/api/ifood/auth/start', 'POST');
}

/**
 * Confirma a autorização com o authorizationCode recebido do portal iFood
 * @param {string} authorizationCode
 */
export async function confirmarAutorizacaoIfood(authorizationCode) {
  return apiCall('/api/ifood/auth/confirm', 'POST', { authorizationCode });
}

/**
 * Verifica o status da conexão iFood
 * @returns {{ connected: boolean, merchantName?: string, merchantId?: string }}
 */
export async function verificarStatusIfood() {
  return apiCall('/api/ifood/status');
}

// ==================== PEDIDOS ====================

/**
 * Lista os pedidos ativos do iFood
 * @returns {Array} Lista de pedidos
 */
export async function listarPedidosIfood() {
  return apiCall('/api/ifood/orders');
}

/**
 * Obtém detalhes completos de um pedido
 * @param {string} orderId
 */
export async function detalhesPedidoIfood(orderId) {
  return apiCall(`/api/ifood/orders/${orderId}`);
}

/**
 * Confirma recebimento de um pedido iFood
 * @param {string} orderId
 */
export async function confirmarPedidoIfood(orderId) {
  return apiCall(`/api/ifood/orders/${orderId}/confirm`, 'POST');
}

/**
 * Inicia a preparação de um pedido
 * @param {string} orderId
 */
export async function iniciarPreparoIfood(orderId) {
  return apiCall(`/api/ifood/orders/${orderId}/start-preparation`, 'POST');
}

/**
 * Marca pedido como pronto para entrega
 * @param {string} orderId
 */
export async function pedidoProntoIfood(orderId) {
  return apiCall(`/api/ifood/orders/${orderId}/ready-to-pickup`, 'POST');
}

/**
 * Despacha entrega do pedido
 * @param {string} orderId
 */
export async function despacharPedidoIfood(orderId) {
  return apiCall(`/api/ifood/orders/${orderId}/dispatch`, 'POST');
}

/**
 * Cancela um pedido iFood
 * @param {string} orderId
 * @param {string} reason - Motivo do cancelamento
 */
export async function cancelarPedidoIfood(orderId, reason = 'STORE_REJECT') {
  return apiCall(`/api/ifood/orders/${orderId}/cancel`, 'POST', { reason });
}

// ==================== EVENTOS (POLLING) ====================

/**
 * Busca eventos de pedidos via polling (novos pedidos, atualizações)
 * @returns {Array} Lista de eventos
 */
export async function buscarEventosIfood() {
  return apiCall('/api/ifood/events');
}

/**
 * Confirma recebimento dos eventos (acknowledgment)
 * @param {Array} eventIds - IDs dos eventos a confirmar
 */
export async function confirmarEventosIfood(eventIds) {
  return apiCall('/api/ifood/events/ack', 'POST', { eventIds });
}

// ==================== MERCHANT ====================

/**
 * Obtém informações da loja no iFood
 */
export async function getMerchantInfo() {
  return apiCall('/api/ifood/merchant');
}

/**
 * Obtém status de abertura/fechamento da loja
 */
export async function getStatusLoja() {
  return apiCall('/api/ifood/merchant/status');
}

// ==================== CATÁLOGO ====================

/**
 * Lista o catálogo de produtos do iFood
 */
export async function getCatalogIfood() {
  return apiCall('/api/ifood/catalog');
}

export default {
  iniciarAutorizacaoIfood,
  confirmarAutorizacaoIfood,
  verificarStatusIfood,
  listarPedidosIfood,
  detalhesPedidoIfood,
  confirmarPedidoIfood,
  iniciarPreparoIfood,
  pedidoProntoIfood,
  despacharPedidoIfood,
  cancelarPedidoIfood,
  buscarEventosIfood,
  confirmarEventosIfood,
  getMerchantInfo,
  getStatusLoja,
  getCatalogIfood,
};
