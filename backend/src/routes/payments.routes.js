import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { asaasService } from '../modules/integrations/asaas/asaas.service.js';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * 📡 WEBHOOK ASAAS (Recebimento de Eventos)
 * Endpoint: /api/payments/webhook
 */
router.post('/webhook', async (req, res) => {
  const asaasToken = req.headers['asaas-access-token'];
  const payload = req.body;
  const { event } = payload;
  const eventId = payload.id; // ID Único do Evento no Asaas
  
  // 🛡️ 1. Validação de Segurança
  if (process.env.ASAAS_WEBHOOK_SECRET && asaasToken !== process.env.ASAAS_WEBHOOK_SECRET) {
    console.warn(`[Asaas Webhook] Tentativa não autorizada. Token: ${asaasToken}`);
    return res.status(401).json({ error: 'Token inválido' });
  }

  try {
    // 🛡️ 2. IDEMPOTÊNCIA (Não processar o mesmo evento duas vezes)
    const [existingEvent] = await query(
      'SELECT id FROM events_log WHERE event_id = ? LIMIT 1',
      [eventId]
    );

    if (existingEvent) {
       console.log(`[Asaas Webhook] Evento ${eventId} já processado. Ignorando.`);
       return res.status(200).send('OK (Duplicated)');
    }

    // 📝 3. REGISTRAR EVENTO NA FILA (events_log)
    const [logResult] = await query(
      'INSERT INTO events_log (event_id, event_type, payload) VALUES (?, ?, ?)',
      [eventId, event, JSON.stringify(payload)]
    );
    const loggedEventId = logResult?.insertId;

    // ⚙️ 4. PROCESSAMENTO POR CATEGORIA (Lógica de Negócio)
    
    // --- MÓDULO 1: COBRANÇAS (PAYMENT_*) ---
    if (event.startsWith('PAYMENT_')) {
      const p = payload.payment;
      
      // UPSERT PAYMENT (Core)
      let currentPaymentId;
      const [existingPayment] = await query('SELECT id FROM payments WHERE asaas_id = ? LIMIT 1', [p.id]);
      
      const paymentData = {
         asaas_id: p.id,
         customer_id: p.customer,
         subscription_id: p.subscription,
         billing_type: p.billingType,
         status: p.status,
         value: p.value,
         net_value: p.netValue,
         due_date: p.dueDate,
         payment_date: p.confirmedDate || p.paymentDate,
         description: p.description,
         bank_slip_url: p.bankSlipUrl,
         invoice_url: p.invoiceUrl
      };

      if (existingPayment) {
         currentPaymentId = existingPayment.id;
         await query(
            `UPDATE payments SET 
               status = ?, value = ?, net_value = ?, due_date = ?, 
               payment_date = ?, description = ?, bank_slip_url = ?, invoice_url = ?, 
               updated_at = NOW() 
             WHERE id = ?`,
            [
               paymentData.status, paymentData.value, paymentData.net_value, paymentData.due_date,
               paymentData.payment_date, paymentData.description, paymentData.bank_slip_url, paymentData.invoice_url,
               currentPaymentId
            ]
         );
      } else {
         currentPaymentId = uuidv4();
         await query(
            `INSERT INTO payments (
               id, asaas_id, customer_id, subscription_id, billing_type, status, 
               value, net_value, due_date, payment_date, description, bank_slip_url, invoice_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
               currentPaymentId, paymentData.asaas_id, paymentData.customer_id, paymentData.subscription_id, 
               paymentData.billing_type, paymentData.status, paymentData.value, paymentData.net_value, 
               paymentData.due_date, paymentData.payment_date, paymentData.description, 
               paymentData.bank_slip_url, paymentData.invoice_url
            ]
         );
      }

      // REGISTRAR HISTÓRICO DE STATUS (Auditoria)
      await query(
         'INSERT INTO payment_status_history (payment_id, status, event_type) VALUES (?, ?, ?)',
         [currentPaymentId, p.status, event]
      );

      // 💸 LEDGER FINANCEIRO (Transações) - Se recebido, gera Crédito
      if (['PAYMENT_RECEIVED', 'PAYMENT_SETTLED', 'PAYMENT_CONFIRMED'].includes(event)) {
         await query(
            'INSERT INTO financial_transactions (payment_id, type, category, amount, description) VALUES (?, ?, ?, ?, ?)',
            [currentPaymentId, 'CREDIT', 'PAYMENT', p.netValue || p.value, `Recebimento Ref: ${p.id}`]
         );

         // Atualizar Pedido se houver referência externa
         if (p.externalReference) {
            await query(
               'UPDATE pedidos SET status = ?, updated_at = NOW() WHERE id = ?',
               ['pago', p.externalReference]
            );
         }
      }

      // Se Estornado / Chargeback
      if (['PAYMENT_REFUNDED', 'PAYMENT_CHARGEBACK_REQUESTED'].includes(event)) {
         await query(
            'INSERT INTO financial_transactions (payment_id, type, category, amount, description) VALUES (?, ?, ?, ?, ?)',
            [currentPaymentId, 'DEBIT', event.includes('REFUND') ? 'REFUND' : 'CHARGEBACK', p.value, `Reversão/Disputa Ref: ${p.id}`]
         );
      }
    }

    // --- MÓDULO 2: NOTAS FISCAIS (INVOICE_*) ---
    if (event.startsWith('INVOICE_')) {
       // Lógica similar para invoices usando tabela invoices
    }

    // Marca como processado com sucesso
    if (loggedEventId) {
       await query('UPDATE events_log SET processed = true WHERE id = ?', [loggedEventId]);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('[Asaas Webhook Critical Error]', err.message);
    res.status(500).json({ error: 'Falha crítica no processamento do Ledger' });
  }
});

/**
 * 💰 BUSCAR SALDO REAL-TIME DO ASAAS
 */
router.get('/balance', async (req, res) => {
   try {
      const balance = await asaasService.getAccountBalance();
      res.json({ success: true, balance });
   } catch (err) {
      res.status(500).json({ success: false, error: err.message });
   }
});

/**
 * 🔄 SINCRONIZAR TODOS OS CLIENTES COM ASAAS
 */
router.post('/sync-customers', async (req, res) => {
   try {
      // 1. Buscar todos os clientes do MySQL
      const dbClientes = await query('SELECT * FROM clientes');

      // 2. Buscar clientes existentes no Asaas (Pre-match)
      const asaasData = await asaasService.listCustomers();
      const asaasMap = new Map();
      asaasData.data.forEach(ac => {
         if (ac.cpfCnpj) asaasMap.set(ac.cpfCnpj, ac.id);
         if (ac.email) asaasMap.set(ac.email.toLowerCase(), ac.id);
      });

      const results = { created: 0, updated: 0, matched: 0, errors: 0 };

      // 3. Sincronizar um por um
      for (const c of dbClientes) {
         try {
            let asaasId = c.asaas_customer_id;

            // Tentar Match se não tiver ID
            if (!asaasId) {
               const cpf_cnpj_clean = c.cpf?.replace(/\D/g, ''); 
               asaasId = asaasMap.get(cpf_cnpj_clean) || asaasMap.get(c.email?.toLowerCase());
            }

            if (!asaasId) {
               // Criar novo se não achou match
               const customer = await asaasService.getOrCreateCustomer({
                  nome: c.nome,
                  email: c.email || `${c.nome.toLowerCase().replace(/ /g, '.')}@hotdogvini.com`,
                  cpfCnpj: c.cpf?.replace(/\D/g, '')
               });
               asaasId = customer.id;
               results.created++;
            } else {
               results.matched++;
            }

            if (asaasId !== c.asaas_customer_id) {
               await query(
                 'UPDATE clientes SET asaas_customer_id = ? WHERE id = ?',
                 [asaasId, c.id]
               );
               results.updated++;
            }
         } catch (err) {
            console.error(`[Sync Error] Cliente ${c.nome}:`, err.message);
            results.errors++;
         }
      }

      res.json({ success: true, results });
   } catch (err) {
      res.status(500).json({ success: false, error: err.message });
   }
});

/**
 * 📄 EMITIR BOLETO / COBRANÇA MANUAL
 */
router.post('/issue-asaas', async (req, res) => {
  try {
     const { userId, total, descricao, metodo } = req.body;
     
     // Buscar dados do usuário para o Asaas (MySQL table users/clientes depends on implementation)
     const [usuario] = await query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);

     if (!usuario) throw new Error('Usuário não encontrado');

     // Assumindo que asaas_customer_id está na tabela clientes vinculada por user_id
     const [cliente] = await query('SELECT asaas_customer_id FROM clientes WHERE user_id = ? LIMIT 1', [userId]);
     
     const asaasCustomerId = cliente?.asaas_customer_id || usuario.asaas_customer_id;

     if (!asaasCustomerId) throw new Error('Cliente não possui ID do Asaas vinculado');

     // Criar pagamento no Asaas
     const asaasPayment = await asaasService.createPayment({
       asaasCustomerId,
       valor: total,
       metodo: metodo || 'PIX',
       descricao: descricao || 'Cobrança Avulsa'
     });

     res.json({ success: true, payment: asaasPayment });
  } catch (err) {
     res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * 🛑 NEGATIVAR (Solicitar ao Asaas)
 */
router.post('/negativar', async (req, res) => {
   try {
      const { paymentId } = req.body;
      const result = await asaasService.negativar(paymentId);
      res.json({ success: true, data: result });
   } catch (err) {
      res.status(400).json({ success: false, error: err.message });
   }
});

/**
 * 💰 LISTAR TODAS AS COBRANÇAS (ERP)
 */
router.get('/list', async (req, res) => {
   try {
      const data = await query('SELECT * FROM payments ORDER BY created_at DESC');
      res.json({ success: true, payments: data });
   } catch (err) {
      res.status(500).json({ success: false, error: err.message });
   }
});

/**
 * 📜 HISTÓRICO DE UMA COBRANÇA
 */
router.get('/:id/history', async (req, res) => {
   try {
      const data = await query(
         'SELECT * FROM payment_status_history WHERE payment_id = ? ORDER BY created_at ASC',
         [req.params.id]
      );
      res.json({ success: true, history: data });
   } catch (err) {
      res.status(500).json({ success: false, error: err.message });
   }
});

/**
 * 💸 LEDGER: TODAS AS TRANSAÇÕES FINANCEIRAS
 */
router.get('/transactions', async (req, res) => {
   try {
      const data = await query(`
         SELECT ft.*, p.asaas_id, p.status as payment_status
         FROM financial_transactions ft
         LEFT JOIN payments p ON ft.payment_id = p.id
         ORDER BY ft.created_at DESC
      `);
      res.json({ success: true, transactions: data });
   } catch (err) {
      res.status(500).json({ success: false, error: err.message });
   }
});

export default router;

