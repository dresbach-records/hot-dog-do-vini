import axios from 'axios';

const ASAAS_API_URL = process.env.ASAAS_URL || 'https://sandbox.asaas.com/api/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

// Instância com interceptor para lidar com falta de token
const api = axios.create({
  baseURL: ASAAS_API_URL,
  headers: {
    'access_token': ASAAS_API_KEY || 'no_token',
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
    if (!ASAAS_API_KEY || ASAAS_API_KEY.includes('Placeholder')) {
       console.warn('[Asaas] Ignorando chamada: API Key não configurada');
       return { id: 'cust_mock_' + Date.now() };
    }
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
   */
  async createPayment(data) {
    if (!ASAAS_API_KEY || ASAAS_API_KEY.includes('Placeholder')) {
       return { id: 'pay_mock_' + Date.now(), invoiceUrl: '#' };
    }
    try {
      const payload = {
        customer: data.asaasCustomerId,
        billingType: data.metodo || 'UNDEFINED',
        value: data.valor,
        dueDate: data.vencimento || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
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
     if (!ASAAS_API_KEY) return { data: [] };
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
   * FIXED: Graceful handling of missing API Key
   */
  async getAccountBalance() {
    if (!ASAAS_API_KEY || ASAAS_API_KEY.includes('Placeholder')) {
      return { balance: 0, reservedBalance: 0 };
    }
    try {
      const response = await api.get('/finance/balance');
      return response.data;
    } catch (err) {
      console.warn('[Asaas Balance Error] Retornando saldo zero por falta de autorização');
      return { balance: 0, reservedBalance: 0 };
    }
  },

  /**
   * 📄 NOTAS FISCAIS (NF-e)
   */
  async createInvoice(data) {
     if (!ASAAS_API_KEY) return { id: 'inv_mock' };
     try {
        const response = await api.post('/invoices', data);
        return response.data;
     } catch (err) {
        console.error('[Asaas Invoice Error]', err.response?.data || err.message);
        throw new Error('Falha ao emitir Nota Fiscal');
     }
  },

  /**
   * 🔄 ASSINATURAS (Subscriptions)
   */
  async createSubscription(data) {
     if (!ASAAS_API_KEY) return { id: 'sub_mock' };
     try {
        const response = await api.post('/subscriptions', data);
        return response.data;
     } catch (err) {
        console.error('[Asaas Sub Error]', err.response?.data || err.message);
        throw new Error('Falha ao criar assinatura');
     }
  },

  /**
   * 💸 TRANSFERÊNCIAS (Transfers)
   */
  async createTransfer(data) {
     if (!ASAAS_API_KEY) throw new Error('API Key Asaas obrigatória para transferências');
     try {
        const response = await api.post('/transfers', data);
        return response.data;
     } catch (err) {
        console.error('[Asaas Transfer Error]', err.response?.data || err.message);
        throw new Error('Falha ao realizar transferência');
     }
  },

  /**
   * 📈 ANTECIPAÇÕES (Anticipations)
   */
  async getAnticipations() {
     if (!ASAAS_API_KEY) return [];
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
   */
  async negativar(paymentId) {
    if (!ASAAS_API_KEY) throw new Error('API Key Asaas necessária');
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
     if (!ASAAS_API_KEY) return {};
     try {
       const response = await api.get(`/payments/${id}`);
       return response.data;
     } catch (err) {
       console.error('[Asaas Details Error]', err.response?.data || err.message);
       throw new Error('Falha ao buscar detalhes da cobrança');
     }
  }
};
