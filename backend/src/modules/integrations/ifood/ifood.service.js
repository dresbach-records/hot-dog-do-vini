import axios from 'axios';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { query } from '../../../config/database.js';
import crypto from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_FILE = join(__dirname, '../../../../tokens.json');

const IFOOD_API = 'https://merchant-api.ifood.com.br';
const IFOOD_AUTH = 'https://merchant-api.ifood.com.br/authentication/v1.0';

/**
 * iFood Integration Service — Camada Proxy Resiliente
 */
/**
 * iFood Integration Service — Camada Enterprise Resiliente (v3)
 */
export const ifoodService = {
  
  /**
   * Utilitário: Ler configurações e tokens do MariaDB
   */
  async getConfig(merchantId) {
    // Se não passar id, pega o primeiro configurado (modo single-tenant principal)
    const sql = merchantId 
      ? 'SELECT * FROM ifood_config WHERE merchant_id = ?' 
      : 'SELECT * FROM ifood_config LIMIT 1';
    const params = merchantId ? [merchantId] : [];
    const results = await query(sql, params);
    return results[0] || null;
  },

  /**
   * Utilitário: Salvar/Atualizar tokens e status no MariaDB
   */
  async saveConfig(merchantId, data) {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
    
    values.push(merchantId);
    await query(`UPDATE ifood_config SET ${fields.join(', ')} WHERE merchant_id = ?`, values);
  },

  /**
   * Autenticação Automática e Refresh (DB-Powered)
   */
  async getAccessToken(merchantId) {
    const config = await this.getConfig(merchantId);
    if (!config) throw new Error('🔌 iFood não configurado no banco de dados.');

    // 1. Verifica Expiração (5min margem de segurança)
    if (config.access_token && config.token_expires_at && new Date() < new Date(config.token_expires_at)) {
      return config.access_token;
    }

    // 2. Automático: Refresh Token
    try {
      console.log(`[iFood Pro] Renovando token para merchant: ${config.merchant_id}`);
      const response = await axios.post(`${IFOOD_AUTH}/oauth/token`, new URLSearchParams({
        grantType: 'refresh_token',
        clientId: config.client_id,
        clientSecret: config.client_secret,
        refreshToken: config.refresh_token,
      }), { 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000 
      });

      const { accessToken, refreshToken, expiresIn } = response.data;
      const expiresAt = new Date(Date.now() + (expiresIn * 1000) - 300000); // 5min margin

      await this.saveConfig(config.merchant_id, {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: expiresAt
      });

      return accessToken;
    } catch (err) {
      console.error('[iFood Refresh Error]', err.response?.data || err.message);
      throw new Error(`Falha crítica na renovação do token iFood para ${config.merchant_id}`);
    }
  },

  /**
   * Inicia fluxo OAuth (UserCode - Distributed)
   */
  async authStart(clientId) {
    const cid = clientId || process.env.IFOOD_CLIENT_ID;
    if (!cid) throw new Error('IFOOD_CLIENT_ID não fornecido nem encontrado no ambiente.');
    
    const response = await axios.post(`${IFOOD_AUTH}/oauth/userCode`, new URLSearchParams({
      clientId: cid,
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000 });
    return response.data;
  },

  /**
   * Finaliza OAuth com Authorization Code e Salva no Banco
   */
  async authConfirm(merchantId, clientId, clientSecret, authorizationCode) {
    const response = await axios.post(`${IFOOD_AUTH}/oauth/token`, new URLSearchParams({
      grantType: 'authorization_code',
      code: authorizationCode,
      clientId: clientId,
      clientSecret: clientSecret,
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 10000 });

    const { accessToken, refreshToken, expiresIn } = response.data;
    const expiresAt = new Date(Date.now() + (expiresIn * 1000) - 300000);

    // Upsert na config
    const [exists] = await query('SELECT id FROM ifood_config WHERE merchant_id = ?', [merchantId]);
    
    if (exists) {
      await this.saveConfig(merchantId, {
        client_id: clientId,
        client_secret: clientSecret,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: expiresAt,
        status_loja: 'AVAILABLE'
      });
    } else {
      await query(
        `INSERT INTO ifood_config (merchant_id, client_id, client_secret, access_token, refresh_token, token_expires_at, status_loja) 
         VALUES (?, ?, ?, ?, ?, ?, 'AVAILABLE')`,
        [merchantId, clientId, clientSecret, accessToken, refreshToken, expiresAt]
      );
    }

    return { success: true, message: 'iFood Enterprise conectado e salvo no MariaDB!' };
  },

  /**
   * iFood Events: Polling (Busca novos eventos/pedidos - 30s Loop)
   */
  async polling(merchantId) {
    const config = await this.getConfig(merchantId);
    if (!config || !config.polling_active) return [];

    const token = await this.getAccessToken(config.merchant_id);
    try {
      const response = await axios.get(`${IFOOD_API}/events/v1.0/events:polling`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'x-polling-merchants': config.merchant_id 
        },
        params: { categories: 'ALL' },
        timeout: 10000
      });

      const events = response.data || [];
      
      // Industrial: Logar eventos para auditoria e idempotência
      for (const event of events) {
        await query(
          'INSERT IGNORE INTO ifood_events_log (event_id, order_id, merchant_id, event_code, full_code, sales_channel, payload) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [event.id, event.orderId, event.merchantId, event.code, event.fullCode, event.salesChannel, JSON.stringify(event)]
        );
      }

      return events;
    } catch (err) {
      if (err.response?.status === 204) return []; // Sem novos eventos
      console.error(`[iFood Polling Error] ${config.merchant_id}:`, err.message);
      return [];
    }
  },

  /**
   * iFood Events: Acknowledgment (Confirmação obrigatória para evitar Strikes)
   */
  async acknowledgment(merchantId, eventIds) {
    if (!eventIds || eventIds.length === 0) return;
    
    // iFood espera [{id: ...}, {id: ...}] ou apenas [id, id] dependendo do endpoint (v1.0 usa objetos)
    const payload = eventIds.map(id => (typeof id === 'string' ? { id } : id));
    const token = await this.getAccessToken(merchantId);

    try {
      await axios.post(`${IFOOD_API}/events/v1.0/events/acknowledgment`, payload, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      console.log(`[iFood ACK] ${payload.length} eventos confirmados para ${merchantId}`);
    } catch (err) {
      console.error(`[iFood Ack Error] ${merchantId}:`, err.response?.data || err.message);
      // Aqui poderíamos disparar um retry ou strike-warning interno
    }
  },

  /**
   * iFood Order: Get Detail (Com Retry Logic para 404 Industrial)
   */
  async getOrderDetails(merchantId, orderId, retryCount = 0) {
    const token = await this.getAccessToken(merchantId);
    try {
      const response = await axios.get(`${IFOOD_API}/order/v1.0/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      return response.data;
    } catch (err) {
      // Regra de Homologação: Erro 404 pode ser delay de propagação, tentar por 10min com backoff
      if (err.response?.status === 404 && retryCount < 5) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.warn(`[iFood Order 404] Pedido ${orderId} não encontrado. Tentando novamente em ${delay/1000}s...`);
        await new Promise(r => setTimeout(r, delay));
        return this.getOrderDetails(merchantId, orderId, retryCount + 1);
      }
      throw err;
    }
  },

  /**
   * Plataforma de Negociação: Aceitar Disputa (Handshake)
   */
  async acceptDispute(merchantId, disputeId, reasonData = {}) {
    const token = await this.getAccessToken(merchantId);
    await axios.post(`${IFOOD_API}/order/v1.0/disputes/${disputeId}/accept`, reasonData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    await query('UPDATE ifood_negotiations SET status = "ACCEPTED" WHERE dispute_id = ?', [disputeId]);
    return { success: true };
  },

  /**
   * Plataforma de Negociação: Rejeitar Disputa (Handshake)
   */
  async rejectDispute(merchantId, disputeId, reason) {
    const token = await this.getAccessToken(merchantId);
    await axios.post(`${IFOOD_API}/order/v1.0/disputes/${disputeId}/reject`, { reason }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    await query('UPDATE ifood_negotiations SET status = "REJECTED" WHERE dispute_id = ?', [disputeId]);
    return { success: true };
  },

  /**
   * Plataforma de Negociação: Contraproposta (Alternative)
   */
  async proposedAlternative(merchantId, disputeId, alternativeId, data) {
    const token = await this.getAccessToken(merchantId);
    await axios.post(`${IFOOD_API}/order/v1.0/disputes/${disputeId}/alternatives/${alternativeId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    await query('UPDATE ifood_negotiations SET status = "PROPOSED", metadata = ? WHERE dispute_id = ?', [JSON.stringify(data), disputeId]);
    return { success: true };
  },


  /**
   * Orquestração de Pedidos iFood (Proxy Seguro)
   */
  async listOrders() {
    const token = await this.getAccessToken();
    const response = await axios.get(`${IFOOD_API}/order/v1.0/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page: 0, size: 50 },
      timeout: 5000
    });
    return response.data;
  },

  /**
   * Detalhes do Pedido iFood
   */
  /**
   * Status: Confirmar Pedido
   */
  async confirmOrder(orderId) {
    const token = await this.getAccessToken();
    await axios.post(`${IFOOD_API}/order/v1.0/orders/${orderId}/confirm`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Status: Iniciar Preparação
   */
  async startPreparation(orderId) {
    const token = await this.getAccessToken();
    await axios.post(`${IFOOD_API}/order/v1.0/orders/${orderId}/startPreparation`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Status: Pronto para Retirada / Despacho
   */
  async readyToPickup(orderId) {
    const token = await this.getAccessToken();
    await axios.post(`${IFOOD_API}/order/v1.0/orders/${orderId}/readyToPickup`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Status: Despachar
   */
  async dispatch(orderId) {
    const token = await this.getAccessToken();
    await axios.post(`${IFOOD_API}/order/v1.0/orders/${orderId}/dispatch`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Status: Cancelar
   */
  async cancelOrder(orderId, reason) {
    const token = await this.getAccessToken();
    await axios.post(`${IFOOD_API}/order/v1.0/orders/${orderId}/cancel`, reason, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Solicitar Entregador iFood (Logística)
   */
  async requestLogistic(orderId) {
    const token = await this.getAccessToken();
    await axios.post(`${IFOOD_API}/order/v1.0/orders/${orderId}/dispatch`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Orquestração de Sincronização (Polling -> Detail -> Save -> Ack)
   */
  /**
   * Orquestração de Sincronização Enterprise (Polling -> Logic -> Save -> Ack)
   */
  async syncOrders(merchantId) {
    const events = await this.polling(merchantId);
    if (!events || events.length === 0) return;

    // Ordenar eventos por createdAt (Requisito iFood)
    const sortedEvents = events.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const eventsToAck = [];

    for (const event of sortedEvents) {
      eventsToAck.push({ id: event.id });

      try {
        switch (event.code) {
          case 'PLC': // PLACED (Novo Pedido)
            await this.handleNewOrder(merchantId, event);
            break;

          case 'CAN': // CANCELLED
            await query('UPDATE pedidos SET status = "cancelado" WHERE pagamento_externo_id = ?', [event.orderId]);
            console.log(`[iFood Sync] Pedido ${event.orderId} CANCELADO.`);
            break;

          case 'CFM': // CONFIRMED
            await query('UPDATE pedidos SET status = "confirmado" WHERE pagamento_externo_id = ?', [event.orderId]);
            break;

          case 'RTP': // READY_TO_PICKUP
            await query('UPDATE pedidos SET status = "pronto" WHERE pagamento_externo_id = ?', [event.orderId]);
            break;

          case 'DSP': // DISPATCHED
            await query('UPDATE pedidos SET status = "em_rota" WHERE pagamento_externo_id = ?', [event.orderId]);
            break;

          case 'CON': // CONCLUDED
            await query('UPDATE pedidos SET status = "concluido" WHERE pagamento_externo_id = ?', [event.orderId]);
            break;

          case 'HSD': // HANDSHAKE DISPUTE (Negociação)
            await this.handleHandshake(merchantId, event);
            break;

          default:
            // Outros eventos (ADR, GTO, AAO, etc) podem ser logados ou processados futuramente
            break;
        }
      } catch (err) {
        console.error(`❌ [iFood Sync] Erro ao processar evento ${event.id}:`, err.message);
      }
    }

    // Confirmar processamento em lote
    await this.acknowledgment(merchantId, eventsToAck);
  },

  /**
   * Lógica Interna: Processar Novo Pedido (PLC)
   */
  async handleNewOrder(merchantId, event) {
    // 1. Verificar duplicidade no banco principal
    const [exists] = await query('SELECT id FROM pedidos WHERE pagamento_externo_id = ?', [event.orderId]);
    if (exists) return;

    // 2. Fetch Detalhes (com retry logic p/ 404)
    const detail = await this.getOrderDetails(merchantId, event.orderId);

    // 3. Mapear Dados
    const itens = detail.items.map(item => ({
      id: item.externalCode || item.id,
      titulo: item.name,
      quantidade: item.quantity,
      preco_unitario: item.unitPrice,
      subtotal: item.totalPrice,
      observacao: item.observations || ''
    }));

    const addr = detail.delivery?.deliveryAddress || {};
    const endereco = {
      logradouro: addr.street,
      numero: addr.number,
      bairro: addr.neighborhood,
      cidade: addr.city,
      referencia: addr.reference,
      observacoes_entrega: detail.delivery?.observations || '',
      tipo: 'entrega'
    };

    // 4. Salvar no Banco
    const localId = crypto.randomUUID();
    await query(
      `INSERT INTO pedidos (
        id, itens, total, endereco_entrega, forma_pagamento, 
        pagamento_externo_id, status, created_at, origem_venda, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        localId,
        JSON.stringify(itens),
        detail.total.orderAmount,
        JSON.stringify(endereco),
        `ifood_${detail.payments?.methods?.[0]?.type || 'UNKNOWN'}`,
        event.orderId,
        'pendente',
        new Date(detail.createdAt),
        'ifood',
        JSON.stringify({ 
          salesChannel: event.salesChannel, 
          orderTiming: detail.orderTiming,
          preparationStartDateTime: detail.preparationStartDateTime 
        })
      ]
    );

    console.log(`✅ [iFood Sync] Pedido #${event.orderId} importado com sucesso!`);
    
    // Auto-confirmar agendados (Opcional - Requisito Homologação)
    if (detail.orderTiming === 'SCHEDULED') {
      console.log(`[iFood Sync] Pedido #${event.orderId} é AGENDADO. Auto-confirmando p/ ranking.`);
      await this.confirmOrder(event.orderId);
    }
  },

  /**
   * Lógica Interna: Processar Handshake (Disputa)
   */
  async handleHandshake(merchantId, event) {
    const detail = event.payload || {}; // O payload já foi salvo no log
    
    await query(
      `INSERT INTO ifood_negotiations (
        dispute_id, order_id, action, expires_at, timeout_action, metadata
      ) VALUES (?, ?, ?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE status = 'PENDING'`,
      [
        event.id, 
        event.orderId, 
        event.metadata?.HANDSHAKE_TYPE || 'CANCELLATION',
        new Date(Date.now() + 300000), // Padrão 5min se não vier no metadata
        event.metadata?.TIMEOUT_ACTION || 'REJECT',
        JSON.stringify(event.metadata)
      ]
    );

    console.log(`⚠️ [iFood Handshake] Negociação iniciada p/ pedido ${event.orderId}. DisputeID: ${event.id}`);
  },

  /**
   * Catalog v2: Listar Catálogos (Contextos: DEFAULT, INDOOR)
   */
  async listCatalogs(merchantId) {
    const token = await this.getAccessToken(merchantId);
    const response = await axios.get(`${IFOOD_API}/catalog/v2.0/merchants/${merchantId}/catalogs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Catalog v2: Listar Categorias de um Catálogo
   */
  async listV2Categories(merchantId, catalogId) {
    const token = await this.getAccessToken(merchantId);
    const response = await axios.get(`${IFOOD_API}/catalog/v2.0/merchants/${merchantId}/catalogs/${catalogId}/categories`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { include_items: 'true' }
    });
    return response.data;
  },

  /**
   * Catalog v2: Atualizar Preço de Item (Marketplace/Industrial)
   */
  async updatePrice(merchantId, itemId, priceData) {
    const token = await this.getAccessToken(merchantId);
    await axios.patch(`${IFOOD_API}/catalog/v2.0/merchants/${merchantId}/items/price`, priceData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Catalog v2: Atualizar Status de Item (Disponibilidade)
   */
  async updateItemStatus(merchantId, itemId, statusData) {
    const token = await this.getAccessToken(merchantId);
    await axios.patch(`${IFOOD_API}/catalog/v2.0/merchants/${merchantId}/items/status`, statusData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Merchant API: Status Operacional (Dashboard)
   */
  async getOperationalStatus(merchantId) {
    const token = await this.getAccessToken(merchantId);
    const response = await axios.get(`${IFOOD_API}/merchant/v1.0/merchants/${merchantId}/status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; // [{ "operation": "DELIVERY", "salesChannel": "IFOOD", "available": true, ... }]
  },

  /**
   * Segurança: Validar Assinatura do Webhook (HMAC-SHA256)
   */
  validateSignature(body, signature) {
    const secret = process.env.IFOOD_WEBHOOK_SECRET;
    
    if (!signature || !secret) return false;

    const expected = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(signature)
      );
    } catch (err) {
      console.error('[iFood Service] Erro na validação de assinatura:', err.message);
      return false;
    }
  },

  /**
   * Logística: Alocar Entregador Próprio (Homologação)
   */
  async assignDriver(merchantId, orderId, driverData) {
    const token = await this.getAccessToken(merchantId);
    await this.requestWithRetry('POST', `${IFOOD_API}/logistics/v1.0/orders/${orderId}/assignDriver`, driverData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Logística: Verificar Código de Entrega (PIN - Mandatório)
   */
  async verifyDeliveryCode(merchantId, orderId, code) {
    const token = await this.getAccessToken(merchantId);
    const response = await this.requestWithRetry('POST', `${IFOOD_API}/logistics/v1.0/orders/${orderId}/verifyDeliveryCode`, { code }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; // { success: true/false }
  },

  /**
   * Shipping: Solicitar Entregador iFood (Sob Demanda)
   */
  async requestIFoodDriver(merchantId, orderId, quoteId) {
    const token = await this.getAccessToken(merchantId);
    await this.requestWithRetry('POST', `${IFOOD_API}/shipping/v1.0/orders/${orderId}/requestDriver`, { quoteId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Shipping: Rastreamento em Tempo Real (Available after ASSIGN_DRIVER)
   */
  async getTracking(merchantId, orderId) {
    const token = await this.getAccessToken(merchantId);
    try {
      const response = await this.requestWithRetry('GET', `${IFOOD_API}/shipping/v1.0/orders/${orderId}/tracking`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (err) {
      if (err.response?.status === 404) return null; // Entregador ainda não alocado
      throw err;
    }
  },

  /**
   * Logística Externa: Verificar Disponibilidade (Cotação p/ WhatsApp/Telefone)
   */
  async getDeliveryAvailability(merchantId, lat, lng) {
    const token = await this.getAccessToken(merchantId);
    const response = await this.requestWithRetry('GET', `${IFOOD_API}/shipping/v1.0/merchants/${merchantId}/deliveryAvailabilities`, {}, {
      headers: { Authorization: `Bearer ${token}` },
      params: { latitude: lat, longitude: lng }
    });
    return response.data; // Retorna quoteId e preços
  },

  /**
   * Logística Externa: Registrar Pedido Offline (WhatsApp -> Entregador iFood)
   */
  async registerExternalOrder(merchantId, orderData) {
    const token = await this.getAccessToken(merchantId);
    const response = await this.requestWithRetry('POST', `${IFOOD_API}/shipping/v1.0/merchants/${merchantId}/orders`, orderData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; // { id, trackingUrl }
  },

  /**
   * Logística Externa: Gestão de Mudança de Endereço
   */
  async respondAddressChange(merchantId, orderId, action, data = {}) {
    const token = await this.getAccessToken(merchantId);
    const endpoint = action === 'ACCEPT' ? 'acceptDeliveryAddressChange' : 'denyDeliveryAddressChange';
    await this.requestWithRetry('POST', `${IFOOD_API}/shipping/v1.0/orders/${orderId}/${endpoint}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Logística Externa: Monitorar Nível de Confiança (Anti-Fraude)
   */
  async getSafeDeliveryScore(merchantId, orderId) {
    const token = await this.getAccessToken(merchantId);
    try {
      const response = await this.requestWithRetry('GET', `${IFOOD_API}/shipping/v1.0/orders/${orderId}/safeDelivery`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data; // { score: 'VERY_HIGH', rules: {...} }
    } catch (err) {
      return { score: 'UNKNOWN', error: err.message };
    }
  },


  /**
   * Helper Industrial: Request com Retry e Backoff Exponencial
   * (Requisito Não-Funcional de Homologação)
   */
  async requestWithRetry(method, url, data = {}, config = {}, retryCount = 0) {
    try {
      const response = await axios({ method, url, data, ...config });
      return response;
    } catch (err) {
      const isTransient = !err.response || (err.response.status >= 500 && err.response.status <= 504) || err.response.status === 429;
      
      if (isTransient && retryCount < 4) {
        const delay = Math.pow(2, retryCount) * 1000 + (Math.random() * 1000); // Backoff + Jitter
        console.warn(`[iFood Retry] Falha em ${url}. Tentativa ${retryCount + 1} em ${Math.round(delay)}ms...`);
        await new Promise(r => setTimeout(r, delay));
        return this.requestWithRetry(method, url, data, config, retryCount + 1);
      }
      throw err;
    }
  },

  /**
   * Orquestração de Sincronização Enterprise (Polling -> Logic -> Save -> Ack)
   */
  async syncOrders(merchantId) {
    const events = await this.polling(merchantId);
    if (!events || events.length === 0) return;

    const sortedEvents = events.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const eventsToAck = [];

    for (const event of sortedEvents) {
      eventsToAck.push({ id: event.id });

      // Auditoria de Eventos Industrial (Persistência para Idempotência e Log)
      try {
        await query(
          'INSERT IGNORE INTO ifood_events_log (event_id, order_id, merchant_id, event_code, payload_bruto) VALUES (?, ?, ?, ?, ?)',
          [event.id, event.orderId, merchantId, event.code, JSON.stringify(event)]
        );
      } catch (err) {
        console.error('[iFood Audit Log Error]', err.message);
      }

      try {
        switch (event.code) {
          case 'PLC': await this.handleNewOrder(merchantId, event); break;
          case 'CAN': await query('UPDATE pedidos SET status = "cancelado" WHERE pagamento_externo_id = ?', [event.orderId]); break;
          case 'CFM': await query('UPDATE pedidos SET status = "confirmado" WHERE pagamento_externo_id = ?', [event.orderId]); break;
          case 'RTP': await query('UPDATE pedidos SET status = "pronto" WHERE pagamento_externo_id = ?', [event.orderId]); break;
          case 'DSP': await query('UPDATE pedidos SET status = "em_rota" WHERE pagamento_externo_id = ?', [event.orderId]); break;
          case 'CON': await query('UPDATE pedidos SET status = "concluido" WHERE pagamento_externo_id = ?', [event.orderId]); break;
          case 'HSD': await this.handleHandshake(merchantId, event); break;
        }
      } catch (err) {
        console.error(`❌ [iFood Sync] Erro em evento ${event.id}:`, err.message);
      }
    }
    await this.acknowledgment(merchantId, eventsToAck);
  },

  /**
   * Lógica Interna: Processar Novo Pedido (PLC)
   */
  async handleNewOrder(merchantId, event) {
    const [exists] = await query('SELECT id FROM pedidos WHERE pagamento_externo_id = ?', [event.orderId]);
    if (exists) return;

    const detail = await this.getOrderDetails(merchantId, event.orderId);

    const itens = detail.items.map(item => ({
      id: item.externalCode || item.id,
      titulo: item.name,
      quantidade: item.quantity,
      preco_unitario: item.unitPrice,
      subtotal: item.totalPrice,
      observacao: item.observations || ''
    }));

    const addr = detail.delivery?.deliveryAddress || {};
    const endereco = {
      logradouro: addr.street || addr.streetName,
      numero: addr.number || addr.streetNumber,
      bairro: addr.neighborhood,
      cidade: addr.city,
      referencia: addr.reference,
      observacoes_entrega: detail.delivery?.observations || '',
      tipo: 'entrega'
    };

    const localId = crypto.randomUUID();
    await query(
      `INSERT INTO pedidos (
        id, itens, total, endereco_entrega, forma_pagamento, 
        pagamento_externo_id, status, created_at, origem_venda, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        localId,
        JSON.stringify(itens),
        detail.total?.orderAmount || detail.payments?.pending || 0,
        JSON.stringify(endereco),
        `ifood_${detail.payments?.methods?.[0]?.type || 'ONLINE'}`,
        event.orderId,
        'pendente',
        new Date(detail.createdAt),
        'ifood',
        JSON.stringify({ 
          salesChannel: event.salesChannel, 
          orderTiming: detail.orderTiming,
          pickupCode: detail.pickupCode, // Requisito de Homologação
          displayId: detail.displayId
        })
      ]
    );

    if (detail.orderTiming === 'SCHEDULED') {
      await this.confirmOrder(event.orderId, merchantId);
    }
  },

  /**
   * Status Change com Idempotency Key
   */
  async confirmOrder(orderId, merchantId) {
    const token = await this.getAccessToken(merchantId);
    await this.requestWithRetry('POST', `${IFOOD_API}/order/v1.0/orders/${orderId}/confirm`, {}, {
      headers: { Authorization: `Bearer ${token}`, 'x-idempotency-key': `confirm-${orderId}` }
    });
    return { success: true };
  },

  async cancelOrder(orderId, merchantId, reasonData) {
    const token = await this.getAccessToken(merchantId);
    await this.requestWithRetry('POST', `${IFOOD_API}/order/v1.0/orders/${orderId}/cancel`, reasonData, {
      headers: { Authorization: `Bearer ${token}`, 'x-idempotency-key': `cancel-${orderId}` }
    });
    return { success: true };
  },

  /**
   * Financial: Eventos de Fluxo de Caixa (V3 - Lançamentos Granulares)
   */
  async getFinancialEvents(merchantId, beginDate, endDate) {
    const token = await this.getAccessToken(merchantId);
    const response = await this.requestWithRetry('GET', `${IFOOD_API}/financial/v1.0/merchants/${merchantId}/financial-events`, {}, {
      headers: { Authorization: `Bearer ${token}` },
      params: { beginDate, endDate }
    });
    return response.data;
  },

  /**
   * Financial: Liquidação (Settlements - Valores Repassados)
   */
  async getSettlements(merchantId, beginDate, endDate) {
    const token = await this.getAccessToken(merchantId);
    const response = await this.requestWithRetry('GET', `${IFOOD_API}/financial/v1.0/merchants/${merchantId}/settlements`, {}, {
      headers: { Authorization: `Bearer ${token}` },
      params: { beginDate, endDate }
    });
    return response.data;
  },

  /**
   * Financial: Histórico de Vendas (V3.0 - Auditoria)
   */
  async getSalesHistory(merchantId, beginDate, endDate) {
    const token = await this.getAccessToken(merchantId);
    const response = await this.requestWithRetry('GET', `${IFOOD_API}/financial/v3.0/merchants/${merchantId}/sales`, {}, {
      headers: { Authorization: `Bearer ${token}` },
      params: { beginDate, endDate }
    });
    return response.data;
  },

  /**
   * Financial V3: Consolidação de Impacto real no fluxo de caixa
   * Separa o que o iFood deve pagar do que a loja já recebeu no ato (Dinheiro/VA/VR).
   */
  async getFinancialConsolidation(merchantId, month) {
    const beginDate = `${month}-01`;
    const lastDay = new Date(new Date(month).getFullYear(), new Date(month).getMonth() + 1, 0).getDate();
    const endDate = `${month}-${lastDay}`;

    const [sales, events] = await Promise.all([
      this.getSalesHistory(merchantId, beginDate, endDate),
      this.getFinancialEvents(merchantId, beginDate, endDate)
    ]);

    let resumo = {
      totalGMV: 0,
      impactoOnline: 0, 
      semImpacto: 0,    
      comissoes: 0,
      vendasCount: 0,
      netPayable: 0
    };

    if (sales?.sales) {
      resumo.vendasCount = sales.sales.length;
      sales.sales.forEach(sale => {
        const amount = sale.total?.orderAmount || 0;
        resumo.totalGMV += amount;
        if (sale.payments?.methods?.[0]?.paymentResponsible === 'IFOOD') {
          resumo.impactoOnline += amount;
        } else {
          resumo.semImpacto += amount;
        }
      });
    }

    if (events?.financialEvents) {
      events.financialEvents.forEach(ev => {
        if (ev.entryType === 'DEBIT') resumo.comissoes += Math.abs(ev.amount);
      });
    }

    resumo.netPayable = resumo.impactoOnline - resumo.comissoes;
    return resumo;
  },

  /**
   * Financial: Antecipação de Pagamentos (iFood Pago)
   */
  async getAnticipations(merchantId, params = {}) {
    const token = await this.getAccessToken(merchantId);
    const response = await this.requestWithRetry('GET', `${IFOOD_API}/financial/v1.0/merchants/${merchantId}/anticipations`, {}, {
      headers: { Authorization: `Bearer ${token}` },
      params: { ...params } // beginCalculationDate, endCalculationDate, etc
    });
    return response.data;
  },

  /**
   * Financial: Conciliação Sob Demanda (Geração de CSV Assíncrona)
   */
  async requestReconciliation(merchantId, competencia) {
    const token = await this.getAccessToken(merchantId);
    const response = await this.requestWithRetry('POST', `${IFOOD_API}/financial/v1.0/merchants/${merchantId}/reconciliations`, { competencia }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; // { requestId, status }
  },

  /**
   * Reputation: Listar Reviews (Dashboard c/ Normalização V2)
   */
  async getReviews(merchantId, params = {}) {
    const token = await this.getAccessToken(merchantId);
    const response = await this.requestWithRetry('GET', `${IFOOD_API}/review/v2.0/merchants/${merchantId}/reviews`, {}, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page: 1, pageSize: 15, ...params }
    });

    // Normalização V2 -> Vini Format
    if (response.data && response.data.reviews) {
      response.data.reviews = response.data.reviews.map(this._formatReview);
    }

    return response.data;
  },

  /**
   * Helper: Normalizar contrato V2 para o Dashboard
   */
  _formatReview(review) {
    return {
      id: review.id,
      cliente: review.customerName || 'Cliente iFood',
      nota: review.score,
      comentario: review.comment || '',
      data: review.createdAt,
      status: review.status, // CREATED, NOT_REPLIED, REPLIED, PUBLISHED
      precisa_resposta: review.status === 'NOT_REPLIED',
      visibility: review.visibility, // PUBLIC / PRIVATE
      resposta: review.replies && review.replies.length > 0 ? review.replies[0].text : null,
      data_resposta: review.replies && review.replies.length > 0 ? review.replies[0].createdAt : null,
      pedido: {
        id: review.order?.id,
        displayId: review.order?.shortId
      }
    };
  },

  /**
   * Reputation: Responder Avaliação (Janela de 5 dias)
   */
  async respondToReview(merchantId, reviewId, text) {
    const token = await this.getAccessToken(merchantId);
    await this.requestWithRetry('POST', `${IFOOD_API}/review/v2.0/merchants/${merchantId}/reviews/${reviewId}/answers`, { text }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Reputation: Sumário de Notas (Rating Score)
   */
  async getMerchantReviewSummary(merchantId) {
    const token = await this.getAccessToken(merchantId);
    const response = await this.requestWithRetry('GET', `${IFOOD_API}/review/v2.0/merchants/${merchantId}/summary`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data; // { score, totalReviewsCount, validReviewsCount }
  },

  /**
   * Orquestração de Importação de Cardápio (Migração v2-Ready)
   */
  async importCatalog(viniData) {
    try {
      for (const cat of viniData) {
        let [categoria] = await query('SELECT id FROM categorias WHERE ifood_id = ?', [cat.ifood_id]);
        let categoriaId = categoria?.id || crypto.randomUUID();

        if (categoria) {
          await query('UPDATE categorias SET nome = ?, ativa = TRUE WHERE id = ?', [cat.nome, categoriaId]);
        } else {
          await query('INSERT INTO categorias (id, nome, ifood_id, ativa) VALUES (?, ?, ?, TRUE)', [categoriaId, cat.nome, cat.ifood_id]);
        }

        for (const p of cat.produtos) {
          const [produto] = await query('SELECT id FROM produtos WHERE ifood_id = ?', [p.ifood_id]);
          if (produto) {
            await query('UPDATE produtos SET titulo = ?, descricao = ?, preco = ?, imagem_url = ?, disponivel = ? WHERE id = ?', [p.titulo, p.descricao, p.preco, p.imagem_url, p.disponivel, produto.id]);
          } else {
            await query('INSERT INTO produtos (id, categoria_id, titulo, descricao, preco, imagem_url, ifood_id, disponivel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [crypto.randomUUID(), categoriaId, p.titulo, p.descricao, p.preco, p.imagem_url, p.ifood_id, p.disponivel]);
          }
        }
      }
      return { success: true };
    } catch (error) {
      console.error('[iFoodService] Erro na persistência MariaDB:', error);
      throw error;
    }
  }
};





