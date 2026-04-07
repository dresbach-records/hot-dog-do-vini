import express from 'express';
import { asaasService } from '../modules/integrations/asaas/asaas.service.js';
import { supabase } from '../config/supabase.js';

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
    const { data: existingEvent } = await supabase
      .from('events_log')
      .select('id')
      .eq('event_id', eventId)
      .single();

    if (existingEvent) {
       console.log(`[Asaas Webhook] Evento ${eventId} já processado. Ignorando.`);
       return res.status(200).send('OK (Duplicated)');
    }

    // 📝 3. REGISTRAR EVENTO NA FILA (events_log)
    const { data: loggedEvent, error: logErr } = await supabase
      .from('events_log')
      .insert({ event_id: eventId, event_type: event, payload })
      .select().single();

    if (logErr) throw logErr;

    // ⚙️ 4. PROCESSAMENTO POR CATEGORIA (Lógica de Negócio)
    
    // --- MÓDULO 1: COBRANÇAS (PAYMENT_*) ---
    if (event.startsWith('PAYMENT_')) {
      const p = payload.payment;
      
      // UPSERT PAYMENT (Core)
      const { data: updatedPayment, error: pErr } = await supabase.from('payments').upsert({
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
         invoice_url: p.invoiceUrl,
         updated_at: new Date().toISOString()
      }, { onConflict: 'asaas_id' }).select().single();

      if (pErr) throw pErr;

      // REGISTRAR HISTÓRICO DE STATUS (Auditoria)
      await supabase.from('payment_status_history').insert({
         payment_id: updatedPayment.id,
         status: p.status,
         event_type: event
      });

      // 💸 LEDGER FINANCEIRO (Transações) - Se recebido, gera Crédito
      if (['PAYMENT_RECEIVED', 'PAYMENT_SETTLED', 'PAYMENT_CONFIRMED'].includes(event)) {
         await supabase.from('financial_transactions').insert({
            payment_id: updatedPayment.id,
            type: 'CREDIT',
            category: 'PAYMENT',
            amount: p.netValue || p.value,
            description: `Recebimento Ref: ${p.id}`
         });

         // Atualizar Pedido se houver referência externa
         if (p.externalReference) {
            await supabase.from('pedidos').update({ status: 'pago', pago_em: new Date().toISOString() }).eq('id', p.externalReference);
         }
      }

      // Se Estornado / Chargeback
      if (['PAYMENT_REFUNDED', 'PAYMENT_CHARGEBACK_REQUESTED'].includes(event)) {
         await supabase.from('financial_transactions').insert({
            payment_id: updatedPayment.id,
            type: 'DEBIT',
            category: event.includes('REFUND') ? 'REFUND' : 'CHARGEBACK',
            amount: p.value,
            description: `Reversão/Disputa Ref: ${p.id}`
         });
      }
    }

    // --- MÓDULO 2: NOTAS FISCAIS (INVOICE_*) ---
    if (event.startsWith('INVOICE_')) {
       // Lógica similar para invoices usando tabela invoices
    }

    // Marca como processado com sucesso
    await supabase.from('events_log').update({ processed: true }).eq('id', loggedEvent.id);

    res.status(200).send('OK');
  } catch (err) {
    console.error('[Asaas Webhook Critical Error]', err.message);
    res.status(500).json({ error: 'Falha crítica no processamento do Ledger' });
  }
});

/**
 * 💰 BUSCAR SALDO REAL-TIME DO ASAAS
 * Endpoint: /api/payments/balance
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
 * Endpoint: /api/payments/sync-customers
 */
router.post('/sync-customers', async (req, res) => {
   try {
      // 1. Buscar todos os clientes do Supabase
      const { data: dbClientes, error } = await supabase
        .from('clientes')
        .select('*');

      if (error) throw error;

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
               asaasId = asaasMap.get(c.cpf_cnpj) || asaasMap.get(c.email?.toLowerCase());
            }

            if (!asaasId) {
               // Criar novo se não achou match
               const customer = await asaasService.getOrCreateCustomer({
                  nome: c.nome,
                  email: c.email || `${c.nome.toLowerCase().replace(/ /g, '.')}@hotdogvini.com`,
                  cpfCnpj: c.cpf_cnpj
               });
               asaasId = customer.id;
               results.created++;
            } else {
               results.matched++;
            }

            if (asaasId !== c.asaas_customer_id) {
               await supabase
                 .from('clientes')
                 .update({ asaas_customer_id: asaasId })
                 .eq('id', c.id);
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
     
     // Buscar dados do usuário para o Asaas
     const { data: usuario } = await supabase
       .from('usuarios')
       .select('*')
       .eq('id', userId)
       .single();

     if (!usuario) throw new Error('Usuário não encontrado');

     // Criar pagamento no Asaas
     const asaasPayment = await asaasService.createPayment({
       asaasCustomerId: usuario.asaas_customer_id,
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
 * Endpoint: /api/payments/list
 */
router.get('/list', async (req, res) => {
   try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json({ success: true, payments: data });
   } catch (err) {
      res.status(500).json({ success: false, error: err.message });
   }
});

/**
 * 📜 HISTÓRICO DE UMA COBRANÇA
 * Endpoint: /api/payments/:id/history
 */
router.get('/:id/history', async (req, res) => {
   try {
      const { data, error } = await supabase
        .from('payment_status_history')
        .select('*')
        .eq('payment_id', req.params.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      res.json({ success: true, history: data });
   } catch (err) {
      res.status(500).json({ success: false, error: err.message });
   }
});

/**
 * 💸 LEDGER: TODAS AS TRANSAÇÕES FINANCEIRAS
 * Endpoint: /api/payments/transactions
 */
router.get('/transactions', async (req, res) => {
   try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*, payments(asaas_id, status)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json({ success: true, transactions: data });
   } catch (err) {
      res.status(500).json({ success: false, error: err.message });
   }
});

export default router;
