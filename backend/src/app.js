import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';

const app = express();

/**
 * 1. CONFIGURAÇÕES BÁSICAS
 */
app.use(express.json());
app.use(cors({ 
  origin: '*', // Em produção, mude para a URL real do frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'asaas-access-token']
}));

/**
 * 2. RATE LIMITING (Resiliência)
 * 100 requisições a cada 15 minutos por IP
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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
 * 4. TRATAMENTO GLOBAL DE ERROS (10/10)
 */
const isDev = process.env.NODE_ENV !== 'production';

app.use((err, req, res, next) => {
  // Erro de Validação de Esquema (Zod)
  if (err.name === 'ZodError') {
    return res.status(400).json({ 
      success: false, 
      error: 'Dados inválidos', 
      details: err.errors 
    });
  }

  // Erro de Autenticação (Customizado)
  if (err.status === 401) {
    return res.status(401).json({ success: false, error: err.message || 'Não autorizado' });
  }

  // Logging Estruturado (Hiding Stack in Prod)
  console.error({
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
    message: err.message,
    stack: isDev ? err.stack : undefined
  });

  // Resposta Padronizada de Erro de Servidor
  res.status(500).json({ 
    success: false, 
    error: 'Ocorreu um erro interno no servidor.' 
  });
});

export default app;
