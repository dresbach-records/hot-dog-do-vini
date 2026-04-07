import app from './app.js';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { botService } from './modules/bot/bot.service.js';
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

// Inicializar o Bot com acesso ao Socket.io
botService.init(io);

httpServer.listen(PORT, () => {
  console.log(`\n🚀 Backend Industrial Vini's Delivery + ViniBot ON: http://localhost:${PORT}`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Real-time: Socket.io Conectado\n`);
});
