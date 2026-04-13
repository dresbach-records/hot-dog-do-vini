import crypto from 'crypto';
import { ordersService } from '../../orders/orders.service.js';

export const handlePagarmeWebhook = async (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const webhookSecret = process.env.PAGARME_WEBHOOK_SECRET;
  const payload = req.body; // Buffer (precisa ser Buffer!)

  // 1. Validação de Segurança
  if (webhookSecret && signature) {
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = hmac.update(payload).digest('hex');
    const signatureHash = signature.split('=')[1] || signature;

    try {
      const isValid = crypto.timingSafeEqual(
        Buffer.from(signatureHash, 'hex'),
        Buffer.from(digest, 'hex')
      );

      if (!isValid) {
        console.warn('⚠️ [Pagarme Webhook] Assinatura Inválida!');
        return res.status(401).send('Invalid signature');
      }
    } catch (err) {
      console.error('[Pagarme Webhook] Erro na validação:', err.message);
      return res.status(401).send('Validation error');
    }
  }

  // 2. Processamento do Evento
  try {
    const data = JSON.parse(payload.toString());
    const eventType = data.type;
    const orderId = data.data.id;
    const status = data.data.status;

    console.log(`[Pagarme Webhook] Evento: ${eventType} | Status: ${status} | Pedido: ${orderId}`);

    if (eventType === 'order.paid') {
      console.log('✅ Pagamento Confirmado! Acionando Fluxo Fiscal...');
      // 1. Atualizar Status no ERP
      // await ordersService.updateStatusByExternalId(orderId, 'preparo');
      
      // 2. Emitir Nota Fiscal via NFE.io
      try {
        const { nfeService } = await import('../../../fiscal/nfe.service.js');
        await nfeService.issueInvoice(data.data); // data.data contém os dados do pedido do Pagar.me
      } catch (fiscError) {
        console.error('⚠️ Falha ao acionar NFE.io:', fiscError.message);
      }
    }

    if (eventType === 'order.payment_failed') {
      console.warn('❌ Pagamento Falhou!');
    }

    return res.status(200).send('OK');
  } catch (err) {
    console.error('[Pagarme Webhook Error]', err.message);
    return res.status(500).send('Internal Error');
  }
};
