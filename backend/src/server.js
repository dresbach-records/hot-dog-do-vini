import app from './app.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { botService } from './modules/bot/bot.service.js';
import { ifoodService } from './modules/integrations/ifood/ifood.service.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../../.env') });

const PORT = process.env.PORT || 3001;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// Inicializar o Bot com acesso ao Socket.io (Apenas se não estiver desativado)
if (process.env.DISABLE_BOT !== 'true') {
  botService.init(io);
} else {
  console.log('🤖 ViniBot: Desativado via configuração (DISABLE_BOT=true).');
}

httpServer.listen(PORT, () => {
  console.log(`\n🚀 Backend Industrial Vini's Delivery + ViniBot ON: http://localhost:${PORT}`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Real-time: Socket.io Conectado\n`);

  // 🔄 IFOOD PRO SYNC LOOP: Polling a cada 30 segundos
  if (process.env.IFOOD_CLIENT_ID) {
    console.log('🥪 iFood Sync: Motor de Polling Ativado (30s)');
    setInterval(() => {
      ifoodService.syncOrders().catch(err => console.error('❌ [iFood Loop Error]', err.message));
    }, 30000);
  }
});
