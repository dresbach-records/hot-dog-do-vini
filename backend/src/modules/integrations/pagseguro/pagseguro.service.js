import axios from 'axios';

const PAGSEGURO_API = process.env.PAGSEGURO_ENV === 'production' 
  ? 'https://api.pagseguro.com' 
  : 'https://sandbox.api.pagseguro.com';

/**
 * PagSeguro Service — Processamento de Pagamentos (Modular)
 */
export const pagseguroService = {
  
  /**
   * Gera um Pedido no PagSeguro (Pix/Cartão)
   */
  async createOrder(data) {
    const { cart, customer, amount, referenceId } = data;

    const payload = {
      reference_id: referenceId,
      customer: {
        name: customer.nome,
        email: customer.email,
        tax_id: customer.cpf?.replace(/\D/g, '') || '00000000000',
        phones: [{
          country: '55',
          area: '11',
          number: '999999999',
          type: 'MOBILE'
        }]
      },
      items: cart.map(item => ({
        reference_id: item.id || item.title,
        name: item.title,
        quantity: item.qtd || 1,
        unit_amount: Math.round((item.numericPrice || 0) * 100) // Converte para centavos
      })),
      qr_codes: [{
        amount: { value: Math.round(amount * 100) },
        expiration_date: new Date(Date.now() + 3600 * 1000).toISOString()
      }]
    };

    try {
      const response = await axios.post(`${PAGSEGURO_API}/orders`, payload, {
        headers: {
          'Authorization': `Bearer ${process.env.PAGSEGURO_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      return response.data;
    } catch (err) {
      console.error('[PagSeguro Error]', err.response?.data || err.message);
      throw new Error('Falha ao gerar pagamento PagSeguro');
    }
  }
};
