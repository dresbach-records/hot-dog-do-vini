import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { query } from '../infrastructure/database.js';
import { aiService } from '../modules/bot/ai.service.js';

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

export const botWorker = new Worker('incoming-messages', async (job) => {
   const { message, contact, conversation } = job.data;
   
   console.log(`🤖 [Worker] Processando mensagem do ${contact.name}...`);

   try {
      // 1. Processar com IA
      const aiResponseText = await aiService.handle(message, contact, conversation);
      
      // 2. Responder via WhatsApp (A integração real será feita no botService)
      // O botWorker apenas sinaliza que a resposta está pronta ou a envia diretamente se tiver o client
      
      // 3. Atualizar Status do Ticket/Conversa (MySQL)
      await query(
         'UPDATE whatsapp_conversations SET last_message_at = NOW(), status = ?, updated_at = NOW() WHERE id = ?',
         ['bot', conversation.id]
      );

      console.log(`✅ [Worker] Resposta IA enviada para ${contact.name}`);
   } catch (err) {
      console.error('[Worker Error]', err.message);
   }
}, { connection });

console.log('🚀 [Worker System] Bot Worker ON.');

