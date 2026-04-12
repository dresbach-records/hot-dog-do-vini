import axios from 'axios';

class PagarmeService {
  constructor() {
    this.apiKey = process.env.PAGARME_SECRET_KEY;
    this.baseUrl = 'https://api.pagar.me/core/v5';
    this.auth = Buffer.from(`${this.apiKey}:`).toString('base64');
  }

  async createPixOrder(orderData) {
    try {
      const payload = {
        items: orderData.items.map(item => ({
          amount: Math.round(item.preco_unitario * 100), // Em centavos
          description: item.titulo,
          quantity: item.quantidade
        })),
        customer: {
          name: orderData.cliente.nome,
          email: orderData.cliente.email,
          document: orderData.cliente.documento || '00000000000', // Moqca se não tiver
          type: 'individual'
        },
        payments: [{
          payment_method: 'pix',
          pix: {
            expires_in: 3600 // 1 hora
          }
        }]
      };

      const response = await axios.post(`${this.baseUrl}/orders`, payload, {
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        order_id: response.data.id,
        qr_code: response.data.charges[0].last_transaction.qr_code,
        qr_code_url: response.data.charges[0].last_transaction.qr_code_url
      };
    } catch (error) {
      console.error('[PagarmeService Error]', error.response?.data || error.message);
      return { success: false, error: 'Falha ao gerar PIX Pagar.me' };
    }
  }

  async createCardOrder(orderData, cardToken) {
    try {
      const payload = {
        items: orderData.items.map(item => ({
          amount: Math.round(item.preco_unitario * 100),
          description: item.titulo,
          quantity: item.quantidade
        })),
        customer: {
          name: orderData.cliente.nome,
          email: orderData.cliente.email,
          document: orderData.cliente.documento || '00000000000',
          type: 'individual'
        },
        payments: [{
          payment_method: 'credit_card',
          credit_card: {
            card_token: cardToken,
            operation_type: 'auth_and_capture',
            installments: 1
          }
        }]
      };

      const response = await axios.post(`${this.baseUrl}/orders`, payload, {
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        order_id: response.data.id,
        status: response.data.status
      };
    } catch (error) {
      console.error('[PagarmeService Card Error]', error.response?.data || error.message);
      return { success: false, error: 'Falha no processamento do cartão' };
    }
  }
}

export const pagarmeService = new PagarmeService();
