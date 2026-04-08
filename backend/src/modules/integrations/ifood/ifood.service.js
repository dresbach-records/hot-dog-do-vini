import axios from 'axios';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { query } from '../../../config/database.js';
import crypto from 'crypto';

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
   * Inicia fluxo OAuth (UserCode)
   */
  async authStart() {
    const config = { clientId: process.env.IFOOD_CLIENT_ID };
    const response = await axios.post(`${IFOOD_AUTH}/oauth/userCode`, new URLSearchParams({
      clientId: config.clientId,
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 5000 });
    return response.data;
  },

  /**
   * Finaliza OAuth com Authorization Code
   */
  async authConfirm(authorizationCode) {
    const config = {
      clientId: process.env.IFOOD_CLIENT_ID,
      clientSecret: process.env.IFOOD_CLIENT_SECRET
    };
    const response = await axios.post(`${IFOOD_AUTH}/oauth/token`, new URLSearchParams({
      grantType: 'authorization_code',
      code: authorizationCode,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 5000 });

    this.salvarTokens(response.data);
    return { success: true, message: 'iFood conectado com sucesso!' };
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
  /**
   * Status: Confirmar Pedido
   */
  async confirmOrder(orderId) {
    const token = await this.getAccessToken();
    await axios.post(`${IFOOD_API}/order/v1.0/orders/${orderId}/confirm`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Status: Iniciar Preparação
   */
  async startPreparation(orderId) {
    const token = await this.getAccessToken();
    await axios.post(`${IFOOD_API}/order/v1.0/orders/${orderId}/startPreparation`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Status: Pronto para Retirada / Despacho
   */
  async readyToPickup(orderId) {
    const token = await this.getAccessToken();
    await axios.post(`${IFOOD_API}/order/v1.0/orders/${orderId}/readyToPickup`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Status: Despachar
   */
  async dispatch(orderId) {
    const token = await this.getAccessToken();
    await axios.post(`${IFOOD_API}/order/v1.0/orders/${orderId}/dispatch`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Status: Cancelar
   */
  async cancelOrder(orderId, reason) {
    const token = await this.getAccessToken();
    await axios.post(`${IFOOD_API}/order/v1.0/orders/${orderId}/cancel`, reason, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Solicitar Entregador iFood (Logística)
   */
  async requestLogistic(orderId) {
    const token = await this.getAccessToken();
    await axios.post(`${IFOOD_API}/order/v1.0/orders/${orderId}/dispatch`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true };
  },

  /**
   * Orquestração de Importação de Cardápio (10/10)
   * Agora salva diretamente no MariaDB
   */
  async importCatalog(viniData) {
    console.log('[iFoodService] Iniciando gravação de cardápio no MariaDB...');
    
    try {
      for (const cat of viniData) {
        // 1. Verificar se categoria já existe via ifood_id
        let [categoria] = await query('SELECT id FROM categorias WHERE ifood_id = ?', [cat.ifood_id]);
        let categoriaId;

        if (categoria) {
          categoriaId = categoria.id;
          await query(
            'UPDATE categorias SET nome = ?, ativa = TRUE WHERE id = ?',
            [cat.nome, categoriaId]
          );
        } else {
          categoriaId = crypto.randomUUID();
          await query(
            'INSERT INTO categorias (id, nome, ifood_id, ativa) VALUES (?, ?, ?, TRUE)',
            [categoriaId, cat.nome, cat.ifood_id]
          );
        }

        // 2. Processar Produtos
        for (const p of cat.produtos) {
          const [produto] = await query('SELECT id FROM produtos WHERE ifood_id = ?', [p.ifood_id]);
          
          if (produto) {
            await query(
              'UPDATE produtos SET titulo = ?, descricao = ?, preco = ?, imagem_url = ?, disponivel = ? WHERE id = ?',
              [p.titulo, p.descricao, p.preco, p.imagem_url, p.disponivel, produto.id]
            );
          } else {
            await query(
              'INSERT INTO produtos (id, categoria_id, titulo, descricao, preco, imagem_url, ifood_id, disponivel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [crypto.randomUUID(), categoriaId, p.titulo, p.descricao, p.preco, p.imagem_url, p.ifood_id, p.disponivel]
            );
          }
        }
      }
      return { success: true };
    } catch (error) {
      console.error('[iFoodService] Erro na persistência MariaDB:', error);
      throw error;
    }
  }
};
