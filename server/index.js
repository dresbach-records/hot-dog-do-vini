/**
 * server/index.js — Proxy Express para iFood API
 * Vini's ERP — protege clientSecret e centraliza autenticação OAuth iFood
 */

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

const IFOOD_API = 'https://merchant-api.ifood.com.br';
const IFOOD_AUTH = 'https://merchant-api.ifood.com.br/authentication/v1.0';

const PAGSEGURO_TOKEN = process.env.PAGSEGURO_TOKEN;
const PAGSEGURO_EMAIL = process.env.PAGSEGURO_EMAIL;
const PAGSEGURO_API = process.env.PAGSEGURO_ENV === 'production' 
  ? 'https://api.pagseguro.com' 
  : 'https://sandbox.api.pagseguro.com';

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// ==================== TOKEN STORAGE (arquivo local) ====================
const TOKEN_FILE = join(dirname(fileURLToPath(import.meta.url)), 'tokens.json');

function lerTokens() {
  if (!existsSync(TOKEN_FILE)) return null;
  try { return JSON.parse(readFileSync(TOKEN_FILE, 'utf-8')); }
  catch { return null; }
}

function salvarTokens(tokens) {
  writeFileSync(TOKEN_FILE, JSON.stringify({ ...tokens, savedAt: Date.now() }, null, 2));
}

async function getAccessToken() {
  const tokens = lerTokens();
  if (!tokens) throw new Error('iFood não autenticado. Configure as credenciais em Integrações.');

  // Verifica se o token ainda é válido (margem de 5min)
  const expiresAt = tokens.savedAt + (tokens.expiresIn || 3600) * 1000 - 300000;
  if (Date.now() < expiresAt) return tokens.accessToken;

  // Refresh automático
  console.log('[iFood] Token expirado, renovando...');
  const res = await axios.post(`${IFOOD_AUTH}/oauth/token`, new URLSearchParams({
    grantType: 'refresh_token',
    clientId: IFOOD_CLIENT_ID,
    clientSecret: IFOOD_CLIENT_SECRET,
    refreshToken: tokens.refreshToken,
  }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

  salvarTokens(res.data);
  return res.data.accessToken;
}

// ==================== MIDDLEWARE iFood ====================
async function ifoodAuth(req, res, next) {
  try {
    req.ifoodToken = await getAccessToken();
    next();
  } catch (err) {
    res.status(401).json({ connected: false, message: err.message });
  }
}

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// GET /api/ifood/status — verifica se está conectado
app.get('/api/ifood/status', async (req, res) => {
  const tokens = lerTokens();
  if (!tokens) return res.json({ connected: false });
  try {
    const token = await getAccessToken();
    res.json({ connected: true, token: !!token });
  } catch {
    res.json({ connected: false });
  }
});

// POST /api/ifood/auth/start — inicia fluxo OAuth (gera userCode)
app.post('/api/ifood/auth/start', async (req, res) => {
  try {
    const response = await axios.post(`${IFOOD_AUTH}/oauth/userCode`, new URLSearchParams({
      clientId: IFOOD_CLIENT_ID,
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    res.json(response.data);
  } catch (err) {
    console.error('[iFood Auth Start]', err.response?.data || err.message);
    res.status(500).json({ message: err.response?.data?.message || err.message });
  }
});

// POST /api/ifood/auth/confirm — finaliza OAuth com authorizationCode
app.post('/api/ifood/auth/confirm', async (req, res) => {
  const { authorizationCode } = req.body;
  if (!authorizationCode) return res.status(400).json({ message: 'authorizationCode é obrigatório' });

  try {
    const response = await axios.post(`${IFOOD_AUTH}/oauth/token`, new URLSearchParams({
      grantType: 'authorization_code',
      code: authorizationCode,
      clientId: IFOOD_CLIENT_ID,
      clientSecret: IFOOD_CLIENT_SECRET,
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    salvarTokens(response.data);
    console.log('[iFood] Autenticação concluída com sucesso!');
    res.json({ success: true, message: 'iFood conectado com sucesso!' });
  } catch (err) {
    console.error('[iFood Auth Confirm]', err.response?.data || err.message);
    res.status(400).json({ message: err.response?.data?.message || 'Código inválido ou expirado' });
  }
});

// ==================== ROTAS DE PEDIDOS ====================

// GET /api/ifood/orders — lista pedidos ativos
app.get('/api/ifood/orders', ifoodAuth, async (req, res) => {
  try {
    const response = await axios.get(`${IFOOD_API}/order/v1.0/orders`, {
      headers: { Authorization: `Bearer ${req.ifoodToken}` },
      params: { page: 0, size: 50 },
    });
    res.json(response.data);
  } catch (err) {
    console.error('[iFood Orders]', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ message: err.response?.data?.message || err.message });
  }
});

// GET /api/ifood/orders/:id — detalhes de um pedido
app.get('/api/ifood/orders/:id', ifoodAuth, async (req, res) => {
  try {
    const response = await axios.get(`${IFOOD_API}/order/v1.0/orders/${req.params.id}`, {
      headers: { Authorization: `Bearer ${req.ifoodToken}` },
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.response?.data?.message || err.message });
  }
});

// POST /api/ifood/orders/:id/confirm
app.post('/api/ifood/orders/:id/confirm', ifoodAuth, async (req, res) => {
  try {
    await axios.post(`${IFOOD_API}/order/v1.0/orders/${req.params.id}/confirm`, {}, {
      headers: { Authorization: `Bearer ${req.ifoodToken}` },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.response?.data?.message || err.message });
  }
});

// POST /api/ifood/orders/:id/start-preparation
app.post('/api/ifood/orders/:id/start-preparation', ifoodAuth, async (req, res) => {
  try {
    await axios.post(`${IFOOD_API}/order/v1.0/orders/${req.params.id}/startPreparation`, {}, {
      headers: { Authorization: `Bearer ${req.ifoodToken}` },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.response?.data?.message || err.message });
  }
});

// POST /api/ifood/orders/:id/ready-to-pickup
app.post('/api/ifood/orders/:id/ready-to-pickup', ifoodAuth, async (req, res) => {
  try {
    await axios.post(`${IFOOD_API}/order/v1.0/orders/${req.params.id}/readyToPickup`, {}, {
      headers: { Authorization: `Bearer ${req.ifoodToken}` },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.response?.data?.message || err.message });
  }
});

// POST /api/ifood/orders/:id/dispatch
app.post('/api/ifood/orders/:id/dispatch', ifoodAuth, async (req, res) => {
  try {
    await axios.post(`${IFOOD_API}/order/v1.0/orders/${req.params.id}/dispatch`, {}, {
      headers: { Authorization: `Bearer ${req.ifoodToken}` },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.response?.data?.message || err.message });
  }
});

// POST /api/ifood/orders/:id/cancel
app.post('/api/ifood/orders/:id/cancel', ifoodAuth, async (req, res) => {
  try {
    await axios.post(`${IFOOD_API}/order/v1.0/orders/${req.params.id}/cancel`, req.body, {
      headers: { Authorization: `Bearer ${req.ifoodToken}` },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.response?.data?.message || err.message });
  }
});

// ==================== ROTAS DE PAGAMENTOS iFOOD ====================
/**
 * POST /api/ifood/payments/pix
 * Gera uma cobrança Pix para um pedido do site do Vini
 */
app.post('/api/ifood/payments/pix', ifoodAuth, async (req, res) => {
  const { orderId, amount } = req.body;
  
  try {
    // Nota: O endpoint real de Pix depende da feature habilitada no iFood (e.g. iFood Pay)
    // Se for via Merchant API, geralmente é vinculado a um pedido específico.
    // Aqui simulamos a chamada para a API de pagamentos
    const response = await axios.post(`${IFOOD_API}/payment/v1.0/payments`, {
      orderId: orderId,
      amount: { currency: 'BRL', value: amount },
      type: 'DIGITAL',
      method: 'PIX'
    }, {
      headers: { Authorization: `Bearer ${req.ifoodToken}` }
    });

    res.json(response.data);
  } catch (err) {
    console.error('[iFood Pix]', err.response?.data || err.message);
    res.status(500).json({ message: 'Erro ao gerar Pix iFood', error: err.response?.data });
  }
});

// GET /api/ifood/payments/:id/status
app.get('/api/ifood/payments/:id/status', ifoodAuth, async (req, res) => {
  try {
    const response = await axios.get(`${IFOOD_API}/payment/v1.0/payments/${req.params.id}`, {
      headers: { Authorization: `Bearer ${req.ifoodToken}` }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao consultar status pagamento' });
  }
});

// ==================== ROTAS DE PAGAMENTOS PAGSEGURO ====================

/**
 * POST /api/pagseguro/orders
 * Gera um pedido no PagSeguro (Pix ou Outros)
 */
app.post('/api/pagseguro/orders', async (req, res) => {
  const { cart, customer, amount, referenceId } = req.body;

  try {
    const payload = {
      reference_id: referenceId,
      customer: {
        name: customer.nome,
        email: customer.email,
        tax_id: customer.cpf.replace(/\D/g, ''),
        phones: [{
          country: '55',
          area: customer.telefone?.slice(1, 3) || '11',
          number: customer.telefone?.replace(/\D/g, '').slice(2) || '999999999',
          type: 'MOBILE'
        }]
      },
      items: cart.map(item => ({
        reference_id: item.id || item.title,
        name: item.title,
        quantity: item.qtd,
        unit_amount: Math.round(item.numericPrice * 100)
      })),
      qr_codes: [{
        amount: { value: Math.round(amount * 100) },
        expiration_date: new Date(Date.now() + 3600 * 1000).toISOString()
      }],
      notification_urls: [
        'https://www.hotdogdovini.com.br/url-de-notificacao'
      ]
    };

    const response = await axios.post(`${PAGSEGURO_API}/orders`, payload, {
      headers: {
        'Authorization': `Bearer ${PAGSEGURO_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error('[PagSeguro Order]', err.response?.data || err.message);
    res.status(500).json({ 
      message: 'Erro ao gerar pedido PagSeguro', 
      error: err.response?.data || err.message 
    });
  }
});

/**
 * POST /api/pagseguro/notification
 * Recebe notificações do PagSeguro (Webhook)
 */
app.post('/api/pagseguro/notification', async (req, res) => {
  console.log('[PagSeguro Notification]', req.body);
  // Aqui você integraria com o Supabase para atualizar o status do pedido real
  // com base no reference_id e status retornado.
  res.sendStatus(200);
});

// ==================== IMPRESSORA GP iFOOD ====================
/**
 * POST /api/print
 * Envia comando de impressão para o agente local
 */
app.post('/api/print', async (req, res) => {
  const { order } = req.body;
  if (!order) return res.status(400).json({ message: 'Pedido não fornecido' });

  try {
    console.log(`[Printer] Enviando pedido #${order.id} para GP iFood...`);
    
    // Tenta enviar para o serviço local da GP iFood (geralmente escuta na 8080 ou 8091)
    // Se falhar, podemos escrever em um arquivo de log/pasta monitorada
    try {
      await axios.post('http://localhost:8080/print', order, { timeout: 2000 });
    } catch (e) {
      console.warn('[Printer] Agente local iFood não respondeu em localhost:8080. Verifique se o app está aberto.');
    }

    res.json({ success: true, message: 'Comando de impressão enviado com sucesso!' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao processar impressão', error: err.message });
  }
});

// ==================== LOGÍSTICA ====================
/**
 * POST /api/ifood/logistic/dispatch
 * Solicita entregador iFood
 */
app.post('/api/ifood/logistic/dispatch', ifoodAuth, async (req, res) => {
  const { orderId } = req.body;
  try {
    const response = await axios.post(`${IFOOD_API}/order/v1.0/orders/${orderId}/dispatch`, {}, {
      headers: { Authorization: `Bearer ${req.ifoodToken}` }
    });
    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error('[iFood Logistics]', err.response?.data || err.message);
    res.status(500).json({ message: 'Erro ao solicitar logística iFood' });
  }
});

// ==================== ROTAS DE EVENTOS (POLLING) ====================

// GET /api/ifood/events
app.get('/api/ifood/events', ifoodAuth, async (req, res) => {
  try {
    const response = await axios.get(`${IFOOD_API}/order/v1.0/events:polling`, {
      headers: { Authorization: `Bearer ${req.ifoodToken}` },
    });
    res.json(response.data || []);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.response?.data?.message || err.message });
  }
});

// POST /api/ifood/events/ack
app.post('/api/ifood/events/ack', ifoodAuth, async (req, res) => {
  try {
    await axios.post(`${IFOOD_API}/order/v1.0/events/acknowledgment`, req.body.eventIds, {
      headers: { Authorization: `Bearer ${req.ifoodToken}` },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.response?.data?.message || err.message });
  }
});

// ==================== MERCHANT ====================

// GET /api/ifood/merchant
app.get('/api/ifood/merchant', ifoodAuth, async (req, res) => {
  try {
    const response = await axios.get(`${IFOOD_API}/merchant/v1.0/merchants`, {
      headers: { Authorization: `Bearer ${req.ifoodToken}` },
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.response?.data?.message || err.message });
  }
});

// GET /api/ifood/merchant/status
app.get('/api/ifood/merchant/status', ifoodAuth, async (req, res) => {
  try {
    const tokens = lerTokens();
    const merchantId = tokens?.merchantId;
    if (!merchantId) return res.json({ open: false, message: 'merchantId não configurado' });
    
    const response = await axios.get(`${IFOOD_API}/merchant/v1.0/merchants/${merchantId}/status`, {
      headers: { Authorization: `Bearer ${req.ifoodToken}` },
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.response?.data?.message || err.message });
  }
});

// ==================== CATÁLOGO ====================

app.get('/api/ifood/catalog', ifoodAuth, async (req, res) => {
  try {
    const tokens = lerTokens();
    const merchantId = tokens?.merchantId;
    if (!merchantId) return res.json({ message: 'merchantId não configurado' });

    const response = await axios.get(`${IFOOD_API}/catalog/v2.0/merchants/${merchantId}/catalogs`, {
      headers: { Authorization: `Bearer ${req.ifoodToken}` },
    });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ message: err.response?.data?.message || err.message });
  }
});

// ==================== START ====================
app.listen(PORT, () => {
  console.log(`\n🍔 Vini's ERP — Proxy iFood rodando em http://localhost:${PORT}`);
  console.log(`   clientId: ${IFOOD_CLIENT_ID ? '✅ configurado' : '❌ não encontrado'}`);
  console.log(`   clientSecret: ${IFOOD_CLIENT_SECRET ? '✅ configurado' : '❌ não encontrado'}`);
  const tokens = lerTokens();
  console.log(`   Token iFood: ${tokens ? '✅ salvo' : '⚠️  não autenticado (vá em Integrações)'}\n`);
});
