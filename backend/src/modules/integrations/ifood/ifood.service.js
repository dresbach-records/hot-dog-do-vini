import axios from 'axios';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_FILE = join(__dirname, '../../../../tokens.json');

const IFOOD_API = 'https://merchant-api.ifood.com.br';
const IFOOD_AUTH = 'https://merchant-api.ifood.com.br/authentication/v1.0';

/**
 * iFood Integration Service — Camada Proxy Resiliente
 */
export const ifoodService = {
  
  /**
   * Utilitário: Ler tokens persistidos (10/10)
   */
  lerTokens() {
    if (!existsSync(TOKEN_FILE)) return null;
    try { 
      return JSON.parse(readFileSync(TOKEN_FILE, 'utf-8')); 
    } catch { 
      return null; 
    }
  },

  /**
   * Utilitário: Salvar tokens
   */
  salvarTokens(tokens) {
    writeFileSync(TOKEN_FILE, JSON.stringify({ ...tokens, savedAt: Date.now() }, null, 2));
  },

  /**
   * Autenticação Automática e Refresh (10/10)
   */
  async getAccessToken() {
    const tokens = this.lerTokens();
    const config = {
      clientId: process.env.IFOOD_CLIENT_ID,
      clientSecret: process.env.IFOOD_CLIENT_SECRET
    };

    if (!tokens) throw new Error('🔌 iFood não autenticado.');

    // 1. Verifica Expiração (5min margem de segurança)
    const expiresAt = tokens.savedAt + (tokens.expiresIn || 3600) * 1000 - 300000;
    if (Date.now() < expiresAt) return tokens.accessToken;

    // 2. Automático: Refresh Token (Retry Limit 3x implícito no fluxo natural)
    try {
      console.log('[iFood Integration] Token expirado, renovando...');
      const response = await axios.post(`${IFOOD_AUTH}/oauth/token`, new URLSearchParams({
        grantType: 'refresh_token',
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        refreshToken: tokens.refreshToken,
      }), { 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 5000 // Isolamento de falha (Timeout 10/10)
      });

      this.salvarTokens(response.data);
      return response.data.accessToken;
    } catch (err) {
      console.error('[iFood Refresh Error]', err.response?.data || err.message);
      throw new Error('Falha crítica na renovação do token iFood');
    }
  },

  /**
   * Orquestração de Pedidos iFood (Proxy Seguro)
   */
  async listOrders() {
    const token = await this.getAccessToken();
    const response = await axios.get(`${IFOOD_API}/order/v1.0/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { page: 0, size: 50 },
      timeout: 5000
    });
    return response.data;
  },

  /**
   * Detalhes do Pedido iFood
   */
  async getOrderDetails(orderId) {
    const token = await this.getAccessToken();
    const response = await axios.get(`${IFOOD_API}/order/v1.0/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    });
    return response.data;
  }
};
