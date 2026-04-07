import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

// Fila de Mensagens Recebidas (Worker processará IA e Respostas)
export const incomingQueue = new Queue('incoming-messages', { connection });

// Fila de Notificações / Pagamentos
export const notificationQueue = new Queue('notifications', { connection });

console.log('🚀 [Queue System] BullMQ inicializado com Redis.');
