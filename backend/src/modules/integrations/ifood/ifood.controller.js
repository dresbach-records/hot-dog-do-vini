import { ifoodService } from './ifood.service.js';

/**
 * iFood Integration Controller - Industrial Version
 * Covers Auth, Logistics, Shipping, Reputation, and Finance.
 */
export const ifoodController = {
  
  /**
   * 🔐 AUTHENTICATION
   */
  async startAuth(req, res) {
    try {
      const clientId = process.env.IFOOD_CLIENT_ID;
      if (!clientId) throw new Error('IFOOD_CLIENT_ID não configurado nas variáveis de ambiente (.env)');
      const data = await ifoodService.authStart(clientId);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async confirmAuth(req, res) {
    try {
      const { code } = req.body;
      const data = await ifoodService.authConfirm(code);
      res.json(data);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getStatus(req, res) {
    try {
      const tokens = await ifoodService.getAccessToken(); // Revalida e retorna
      // Busca status do merchant (V2)
      const merchants = await ifoodService.getMerchantStatus();
      res.json({ success: true, connected: !!tokens, merchants });
    } catch (error) {
      res.json({ success: true, connected: false, error: error.message });
    }
  },

  /**
   * 📦 ORDERS & OPERATION
   */
  async listOrders(req, res) {
    try {
      const orders = await ifoodService.listOrders();
      res.json({ success: true, orders });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async confirmOrder(req, res) {
    try {
      const { orderId } = req.params;
      const result = await ifoodService.confirmOrder(orderId);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async dispatchOrder(req, res) {
    try {
      const { orderId } = req.params;
      const result = await ifoodService.dispatchOrder(orderId);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getOrderTracking(req, res) {
    try {
      const { orderId } = req.params;
      const tracking = await ifoodService.getOrderTracking(orderId);
      res.json({ success: true, tracking });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * 🚚 LOGISTICS & SHIPPING (V2)
   */
  async checkShippingAvailability(req, res) {
    try {
      const { orderData } = req.body;
      const availability = await ifoodService.checkShippingAvailability(orderData);
      res.json({ success: true, availability });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async requestDriver(req, res) {
    try {
      const { shippingData } = req.body;
      const result = await ifoodService.requestDriver(shippingData);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getShippingStatus(req, res) {
    try {
      const { deliveryId } = req.params;
      const status = await ifoodService.getShippingStatus(deliveryId);
      res.json({ success: true, status });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * ⭐️ REPUTATION (REVIEWS V2)
   */
  async listReviews(req, res) {
    try {
      const { page, dateFrom, dateTo } = req.query;
      const reviews = await ifoodService.listReviews({ page, dateFrom, dateTo });
      res.json({ success: true, reviews });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getReviewSummary(req, res) {
    try {
      const summary = await ifoodService.getMerchantReviewSummary();
      res.json({ success: true, summary });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async answerReview(req, res) {
    try {
      const { reviewId } = req.params;
      const { text } = req.body;
      const result = await ifoodService.answerReview(reviewId, text);
      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * 💰 FINANCIAL (V3)
   */
  async getSales(req, res) {
    try {
      const { beginSalesDate, endSalesDate } = req.query;
      const sales = await ifoodService.getSales(beginSalesDate, endSalesDate);
      res.json({ success: true, sales });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getFinancialEvents(req, res) {
    try {
      const { beginEventDate, endEventDate } = req.query;
      const events = await ifoodService.getFinancialEvents(beginEventDate, endEventDate);
      res.json({ success: true, events });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getSettlements(req, res) {
    try {
      const { beginSettlementDate, endSettlementDate } = req.query;
      const settlements = await ifoodService.getSettlements(beginSettlementDate, endSettlementDate);
      res.json({ success: true, settlements });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async getFinanceConsolidation(req, res) {
    try {
      const { month } = req.query; // Formato YYYY-MM
      const consolidation = await ifoodService.getFinancialConsolidation(null, month || new Date().toISOString().slice(0, 7));
      res.json({ success: true, data: consolidation });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * 🏬 CATALOG
   */
  async getCatalog(req, res) {
    try {
      const catalog = await ifoodService.listCatalogs();
      res.json({ success: true, catalog });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async importCatalog(req, res) {
    try {
      const { catalog } = req.body;
      const result = await ifoodService.importCatalog(catalog);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * 📡 WEBHOOK HANDLER
   */
  async webhookHandler(req, res) {
    try {
      const signature = req.headers['x-ifood-signature'];
      const payload = JSON.stringify(req.body);

      // Validação de segurança
      if (!ifoodService.validateSignature(payload, signature)) {
        return res.status(401).send('Invalid signature');
      }

      const events = req.body;
      console.log('[iFood Webhook] Processando eventos:', events.length);

      // O ifoodService já deve ter lógica para processar na fila BullMQ
      // Aqui apenas confirmamos recebimento
      res.status(202).send(); 
    } catch (error) {
      console.error('[iFood Webhook Controller Error]', error);
      res.status(500).send();
    }
  }
};
