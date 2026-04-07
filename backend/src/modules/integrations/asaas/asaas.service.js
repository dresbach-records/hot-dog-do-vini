import axios from 'axios';

const ASAAS_API_URL = process.env.ASAAS_URL || 'https://sandbox.asaas.com/api/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

const api = axios.create({
  baseURL: ASAAS_API_URL,
  headers: {
    'access_token': ASAAS_API_KEY,
    'Content-Type': 'application/json'
  }
});

/**
 * Asaas Service — Gestão Financeira, Cobranças e Negativação
 */
export const asaasService = {

  /**
   * 👤 CLIENTES (Customers)
   */
  async createCustomer(data) {
    try {
      const response = await api.post('/customers', {
        name: data.nome,
        email: data.email,
        cpfCnpj: data.cpf?.replace(/\D/g, '') || '00000000000',
        mobilePhone: data.telefone || '',
        externalReference: data.id || ''
      });
      return response.data;
    } catch (err) {
      console.error('[Asaas Customer Error]', err.response?.data || err.message);
      throw new Error('Falha ao criar cliente no Asaas');
    }
  },

  /**
   * 💰 COBRANÇAS (Payments)
   * billingType: 'BOLETO', 'CREDIT_CARD', 'PIX'
   */
  async createPayment(data) {
    try {
      const payload = {
        customer: data.asaasCustomerId,
        billingType: data.metodo || 'UNDEFINED',
        value: data.valor,
        dueDate: data.vencimento || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 dias default
        description: data.descricao || 'Pedido Vini Delivery',
        externalReference: data.pedidoId
      };

      const response = await api.post('/payments', payload);
      return response.data;
    } catch (err) {
      console.error('[Asaas Payment Error]', err.response?.data || err.message);
      throw new Error('Falha ao gerar cobrança no Asaas');
    }
  },

  /**
   * 📋 LISTAR TODOS OS CLIENTES (ASAAS)
   */
  async listCustomers() {
     try {
        const response = await api.get('/customers?limit=100');
        return response.data;
     } catch (err) {
        console.error('[Asaas List Customers Error]', err.response?.data || err.message);
        throw new Error('Falha ao listar clientes no Asaas');
     }
  },

  /**
   * 💰 BUSCAR SALDO DA CONTA (ADMIN)
   */
  async getAccountBalance() {
    try {
      const response = await api.get('/finance/balance');
      return response.data;
    } catch (err) {
      console.error('[Asaas Balance Error]', err.response?.data || err.message);
      throw new Error('Falha ao buscar saldo no Asaas');
    }
  },

  /**
   * 📄 NOTAS FISCAIS (NF-e) [Module 2]
   */
  async createInvoice(data) {
     try {
        const response = await api.post('/invoices', data);
        return response.data;
     } catch (err) {
        console.error('[Asaas Invoice Error]', err.response?.data || err.message);
        throw new Error('Falha ao emitir Nota Fiscal');
     }
  },

  /**
   * 🔄 ASSINATURAS (Subscriptions) [Module 7]
   */
  async createSubscription(data) {
     try {
        const response = await api.post('/subscriptions', data);
        return response.data;
     } catch (err) {
        console.error('[Asaas Sub Error]', err.response?.data || err.message);
        throw new Error('Falha ao criar assinatura');
     }
  },

  /**
   * 💸 TRANSFERÊNCIAS (Transfers) [Module 3]
   */
  async createTransfer(data) {
     try {
        const response = await api.post('/transfers', data);
        return response.data;
     } catch (err) {
        console.error('[Asaas Transfer Error]', err.response?.data || err.message);
        throw new Error('Falha ao realizar transferência');
     }
  },

  /**
   * 📈 ANTECIPAÇÕES (Anticipations) [Module 5]
   */
  async getAnticipations() {
     try {
        const response = await api.get('/receivableAnticipations');
        return response.data;
     } catch (err) {
        console.error('[Asaas Anticipation Error]', err.response?.data || err.message);
        throw new Error('Falha ao listar antecipações');
     }
  },

  /**
   * 🛑 NEGATIVAÇÃO (Dunning/Doubtful)
   * Note: This usually requires a specific Asaas plan and Serasa integration.
   */
  async negativar(paymentId) {
    try {
      const response = await api.post(`/payments/${paymentId}/negative`);
      return response.data;
    } catch (err) {
      console.error('[Asaas Negative Error]', err.response?.data || err.message);
      throw new Error('Falha ao solicitar negativação no Asaas');
    }
  },

  /**
   * 📄 BUSCAR BOLETO / PIX
   */
  async getPaymentDetails(id) {
     try {
       const response = await api.get(`/payments/${id}`);
       return response.data;
     } catch (err) {
       console.error('[Asaas Details Error]', err.response?.data || err.message);
       throw new Error('Falha ao buscar detalhes da cobrança');
     }
  }
};
