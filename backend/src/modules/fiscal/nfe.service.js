import axios from 'axios';

/**
 * NFE.io Service — Camada de Integração Fiscal Industrial
 * Gerencia a emissão automática de Notas Fiscais via NFE.io
 */
class NfeService {
  constructor() {
    this.apiKey = process.env.NFE_IO_API_KEY;
    this.companyId = process.env.NFE_IO_COMPANY_ID;
    this.baseUrl = 'https://api.nfe.io/v1/companies';
  }

  /**
   * Emite NF-e/NFS-e a partir de uma cobrança do Pagar.me
   */
  async issueInvoice(orderData) {
    try {
      if (!this.apiKey || !this.companyId) {
        throw new Error('Configurações NFE.io ausentes no ambiente (.env)');
      }

      const payload = {
        cityServiceCode: '1.01', // Código de serviço (Exemplo: Limpeza/Informática) - Deve vir da config da filial
        description: `Ref. Pedido #${orderData.id} - Vini.s Delivery`,
        servicesAmount: Number(orderData.total || 0),
        borrower: {
          federalTaxNumber: orderData.cliente_cpf || '00000000000',
          name: orderData.cliente_nome,
          email: orderData.cliente_email,
          address: {
            street: orderData.rua,
            number: orderData.numero,
            district: orderData.bairro,
            city: { code: '4205407', name: 'Florianópolis' }, // Exemplo: Florianópolis
            state: 'SC',
            zipCode: orderData.cep || '00000000'
          }
        }
      };

      const resp = await axios.post(
        `${this.baseUrl}/${this.companyId}/serviceinvoices`,
        payload,
        {
          headers: {
            'Authorization': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[Fiscal] NF emitida com sucesso para Pedido #${orderData.id}. NF-ID: ${resp.data.id}`);
      return { success: true, invoiceId: resp.data.id };
    } catch (e) {
      console.error('[Fiscal Error]', e.response?.data || e.message);
      return { success: false, error: 'Falha na emissão fiscal NFE.io' };
    }
  }

  /**
   * Consulta status de uma nota emitida
   */
  async getInvoiceStatus(invoiceId) {
    try {
      const resp = await axios.get(
        `${this.baseUrl}/${this.companyId}/serviceinvoices/${invoiceId}`,
        { headers: { 'Authorization': this.apiKey } }
      );
      return resp.data;
    } catch (e) { throw e; }
  }
}

export const nfeService = new NfeService();
