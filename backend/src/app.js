import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { responseHandler } from './middlewares/responseHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/**
 * 0. SEGURANÇA VPS: Trust Proxy
 * Necessário para que o rate-limit e logs enxerguem o IP real do cliente
 * quando rodando atrás do Nginx (Proxy Reverso).
 */
app.set('trust proxy', 1);

/**
 * 1. CONFIGURAÇÕES BÁSICAS
 */
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(cors({ 
  origin: '*', // Em produção, mude para a URL real do frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'asaas-access-token']
}));

/**
 * 2. PADRONIZAÇÃO & RESILIÊNCIA
 */
app.use(responseHandler);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Aumentado para desenvolvimento
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Muitas requisições. Tente novamente mais tarde.' }
});
app.use(limiter);

/**
 * 3. ROTAS CENTRALIZADAS COM PREFIXO /api
 */
app.use('/api', routes);

/**
 * 4. TRATAMENTO GLOBAL DE ERROS (Standardized)
 */
app.use(errorHandler);

export default app;
