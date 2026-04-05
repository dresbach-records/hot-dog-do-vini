/**
 * Utilitário de Logging Estruturado (Vini's Delivery)
 */
const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  info: (message, meta = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta);
  },
  
  warn: (message, meta = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta);
  },

  error: (message, error = {}) => {
    console.error({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error.message,
      stack: isDev ? error.stack : undefined,
      ...error.meta
    });
  }
};
