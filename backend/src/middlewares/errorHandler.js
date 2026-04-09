/**
 * Middleware Global de Tratamento de Erros
 * Captura todos os erros e responde no formato padronizado
 */
export const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  
  // Log estruturado para o backend
  console.error({
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
    message: err.message,
    stack: isDev ? err.stack : undefined
  });

  // Erros de Validação (Zod)
  if (err.name === 'ZodError') {
    return res.status(400).json({ 
      success: false, 
      error: 'Dados de entrada inválidos', 
      details: err.errors 
    });
  }

  // Erros customizados com status
  const status = err.status || 500;
  const message = err.message || 'Erro interno no servidor';

  return res.status(status).json({
    success: false,
    data: isDev ? { stack: err.stack } : null,
    error: message
  });
};
