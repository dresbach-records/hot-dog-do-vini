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

    // Mapeamento de Status Pagar.me -> ERP Vini
    if (eventType === 'order.paid') {
      // Pedido Pago -> Mover para Preparo
      // TODO: Buscar o ID interno do pedido no nosso banco usando o external_id (orderId do Pagar.me)
      console.log('✅ Pagamento Confirmado! Atualizando Kanban...');
      // await ordersService.updateStatusByExternalId(orderId, 'preparo');
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
