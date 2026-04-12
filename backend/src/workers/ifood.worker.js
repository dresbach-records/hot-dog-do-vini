import { Worker, Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';
import { ifoodService } from '../modules/integrations/ifood/ifood.service.js';
import { query } from './../config/database.js';

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: null,
});

/**
 * iFood Heartbeat Worker
 * Responsável por executar o polling de 30s para cada merchant ativo.
 */
export const ifoodWorker = new Worker('ifood-heartbeat', async (job) => {
    const { merchantId } = job.data;
    
    console.log(`🥪 [iFood Heartbeat] Iniciando polling para Merchant: ${merchantId}`);
    
    try {
        await ifoodService.syncOrders(merchantId);
        
        // Atualizar timestamp de último heartbeat no banco
        await query('UPDATE ifood_config SET last_heartbeat = NOW() WHERE merchant_id = ?', [merchantId]);
        
    } catch (err) {
        console.error(`❌ [iFood Heartbeat Error] ${merchantId}:`, err.message);
        throw err; // Permite que o BullMQ tente novamente conforme política de backoff
    }
}, { 
    connection,
    concurrency: 5, // Permite processar até 5 merchants simultaneamente
    limiter: {
        max: 6000,
        duration: 60000 // Respeita o Rate Limit de 6000 RPM do iFood
    }
});

// Queue para inicialização
export const ifoodQueue = new Queue('ifood-heartbeat', { connection });

/**
 * Inicializador: Agenda o polling de 30s para todos os merchants ativos no banco
 */
export async function initIfoodHeartbeat() {
    console.log('📦 [iFood Pro] Inicializando Cron Jobs de Heartbeat...');
    
    const merchants = await query('SELECT merchant_id FROM ifood_config WHERE polling_active = TRUE');
    
    // Limpar jobs antigos para evitar duplicidade em restarts
    await ifoodQueue.drain();
    const repeatableJobs = await ifoodQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
        await ifoodQueue.removeRepeatableByKey(job.key);
    }

    for (const m of merchants) {
        console.log(`   + Agendando 30s loop para: ${m.merchant_id}`);
        await ifoodQueue.add(
            `polling-${m.merchant_id}`, 
            { merchantId: m.merchant_id },
            { 
                repeat: { cron: '*/30 * * * * *' }, // A cada 30 segundos exatos
                removeOnComplete: true,
                removeOnFail: 100 // Manter histórico limitado de falhas
            }
        );
    }
}

console.log('🚀 [iFood Worker] Sistema de Heartbeat Enterprise ON.');
