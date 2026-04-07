import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    // Only retry for 5 seconds total then stop
    if (times > 5) {
      console.warn('⚠️ [Queue System] Redis indisponível. Continuando sem processamento de filas em background.');
      return null; // Stop retrying
    }
    return Math.min(times * 100, 1000);
  }
});

connection.on('error', (err) => {
  // Silence connection errors to prevent crash
  if (err.code === 'ECONNREFUSED') {
    // We already handle this in the retryStrategy output
  } else {
    console.error('❌ [Queue System] Erro de Conexão Redis:', err.message);
  }
});

// Fila de Mensagens Recebidas (Worker processará IA e Respostas)
export const incomingQueue = new Queue('incoming-messages', { connection });

// Fila de Notificações / Pagamentos
export const notificationQueue = new Queue('notifications', { connection });

console.log('🚀 [Queue System] BullMQ inicializado.');
