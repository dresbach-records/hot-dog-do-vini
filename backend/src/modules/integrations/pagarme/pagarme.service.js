import axios from 'axios';

/**
 * PagarmeService Enterprise v5
 * Gerencia toda a infraestrutura financeira e integração de pagamentos.
 */
class PagarmeService {
  constructor() {
    this.apiKey = process.env.PAGAR_ME_API_KEY; // Corrigido para padrão v5
    this.baseUrl = 'https://api.pagar.me/core/v5';
    this.auth = Buffer.from(`${this.apiKey}:`).toString('base64');
  }

  // --- CORE TRANSACTIONS ---
  async getBalance() {
    try {
      const resp = await axios.get(`${this.baseUrl}/balance`, {
        headers: { 'Authorization': `Basic ${this.auth}` }
      });
      return resp.data;
    } catch (e) { throw new Error(`Pagarme Balance Error: ${e.response?.data?.message || e.message}`); }
  }

  async listOrders(params = { page: 1, size: 10 }) {
    try {
      const resp = await axios.get(`${this.baseUrl}/orders`, {
        headers: { 'Authorization': `Basic ${this.auth}` },
        params
      });
      return resp.data;
    } catch (e) { throw new Error(`Pagarme List Orders Error: ${e.response?.data?.message || e.message}`); }
  }

  // --- FINANCIAL MODULES (EXTRATO, TRANSFERÊNCIAS, ANTECIPAÇÕES) ---
  async getStatement(params = { page: 1, size: 10 }) {
    try {
      const resp = await axios.get(`${this.baseUrl}/balance/operations`, {
        headers: { 'Authorization': `Basic ${this.auth}` },
        params
      });
      return resp.data;
    } catch (e) { throw new Error(`Pagarme Statement Error: ${e.response?.data?.message || e.message}`); }
  }

  async listTransfers(params = { page: 1, size: 10 }) {
    try {
      const resp = await axios.get(`${this.baseUrl}/transfers`, {
        headers: { 'Authorization': `Basic ${this.auth}` },
        params
      });
      return resp.data;
    } catch (e) { throw new Error(`Pagarme Transfers Error: ${e.response?.data?.message || e.message}`); }
  }

  async listAnticipations(params = { page: 1, size: 10 }) {
    try {
      const resp = await axios.get(`${this.baseUrl}/anticipations`, {
        headers: { 'Authorization': `Basic ${this.auth}` },
        params
      });
      return resp.data;
    } catch (e) { throw new Error(`Pagarme Anticipations Error: ${e.response?.data?.message || e.message}`); }
  }

  // --- COBRANÇAS E LINKS DE PAGAMENTO ---
  async listCharges(params = { page: 1, size: 10 }) {
    try {
      const resp = await axios.get(`${this.baseUrl}/charges`, {
        headers: { 'Authorization': `Basic ${this.auth}` },
        params
      });
      return resp.data;
    } catch (e) { throw new Error(`Pagarme Charges Error: ${e.response?.data?.message || e.message}`); }
  }

  async listPaymentLinks(params = { page: 1, size: 10 }) {
    try {
      const resp = await axios.get(`${this.baseUrl}/payment_links`, {
        headers: { 'Authorization': `Basic ${this.auth}` },
        params
      });
      return resp.data;
    } catch (e) { throw new Error(`Pagarme Links Error: ${e.response?.data?.message || e.message}`); }
  }

  // --- CONTESTAÇÕES (DISPUTES) ---
  async listDisputes(params = { page: 1, size: 10 }) {
    try {
      const resp = await axios.get(`${this.baseUrl}/disputes`, {
        headers: { 'Authorization': `Basic ${this.auth}` },
        params
      });
      return resp.data;
    } catch (e) { throw new Error(`Pagarme Disputes Error: ${e.response?.data?.message || e.message}`); }
  }
}

export const pagarmeService = new PagarmeService();
