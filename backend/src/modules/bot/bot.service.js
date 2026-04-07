import pkg from '@whiskeysockets/baileys';
const { 
  default: makeWASocket, 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion, 
  makeCacheableSignalKeyStore 
} = pkg;
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode';
import pino from 'pino';
import { supabase } from '../../config/supabase.js';
import { incomingQueue } from '../../infrastructure/queue.js';

let io = null;
let sock = null;
let botStatus = 'DISCONNECTED';

export const botService = {
  
  async init(socketIo) {
    io = socketIo;
    console.log('🤖 ViniBot Engine (SaaS Edition): Inicializando...');
    this.connectToWhatsApp();

    io.on('connection', (socket) => {
       socket.emit('bot-status', { status: botStatus });
       
       socket.on('join-chat', (id) => {
          socket.join(`conversation_${id}`);
       });

       socket.on('send-wa-message', async (data) => {
          try {
             const { phone, content } = data;
             const jid = phone.includes('@s.whatsapp.net') ? phone : `${phone.replace(/\D/g, '')}@s.whatsapp.net`;
             await sock.sendMessage(jid, { text: content });
          } catch (err) {
             console.error('[Socket Send Error]', err.message);
          }
       });
    });
  },

  async connectToWhatsApp() {
     const { state, saveCreds } = await useMultiFileAuthState('./.baileys_auth');
     const { version, isLatest } = await fetchLatestBaileysVersion();
     
     console.log(`🤖 ViniBot: Conectando (Baileys v${version.join('.')}, isLatest: ${isLatest})`);

     sock = makeWASocket({
        version,
        auth: {
           creds: state.creds,
           keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: ["ViniBot PRO", "Industrial", "1.0"]
     });

     sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
           const qrUrl = await qrcode.toDataURL(qr);
           this.setStatus('QR_RECEIVED', qrUrl);
        }

        if (connection === 'close') {
           const shouldReconnect = (lastDisconnect.error instanceof Boom) ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut : true;
           console.log('🤖 Connection closed. Reconnect:', shouldReconnect);
           this.setStatus('DISCONNECTED');
           if (shouldReconnect) this.connectToWhatsApp();
        } else if (connection === 'open') {
           console.log('🤖 ViniBot [SaaS]: Conectado e Pronto!');
           this.setStatus('CONNECTED');
        }
     });

     sock.ev.on('creds.update', saveCreds);

     sock.ev.on('messages.upsert', async (m) => {
        if (m.type === 'notify') {
           for (const msg of m.messages) {
              if (!msg.key.fromMe) {
                 await this.processIncomingMessage(msg);
              }
           }
        }
     });
  },

  setStatus(status, data = null) {
     botStatus = status;
     if (io) io.emit('bot-status', { status, data });
  },

  async processIncomingMessage(msg) {
     const jid = msg.key.remoteJid;
     const phone = jid.split('@')[0];
     const content = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
     const external_id = msg.key.id;

     // 0. Idempotência: Verificar se mensagem já foi processada
     const { data: existing } = await supabase
        .from('whatsapp_messages')
        .select('id')
        .eq('external_id', external_id)
        .single();
     if (existing) return;

     // 1. Sincronizar Contato
     const { data: dbContact } = await supabase
        .from('whatsapp_contacts')
        .upsert({ 
           phone, 
           name: msg.pushName || phone,
           pushname: msg.pushName,
           updated_at: new Date().toISOString()
        }, { onConflict: 'phone' })
        .select()
        .single();

     // 2. Sincronizar Conversa
     const { data: dbConv } = await supabase
        .from('whatsapp_conversations')
        .upsert({ 
           contact_id: dbContact.id,
           last_message_at: new Date().toISOString()
        }, { onConflict: 'contact_id' })
        .select()
        .single();

     // 3. Salvar Mensagem (INBOUND)
     const { data: dbMsg } = await supabase
        .from('whatsapp_messages')
        .insert({
           conversation_id: dbConv.id,
           external_id,
           sender: 'user',
           direction: 'IN',
           content,
           created_at: new Date().toISOString()
        })
        .select()
        .single();

     // 4. Emitir via Socket para a UI (Somente para a sala desta conversa)
     if (io) {
        io.to(`conversation_${dbConv.id}`).emit('new-message', dbMsg);
        io.emit('chat-update', { id: dbConv.id, lastMsg: content }); // Update side-list
     }

     // 5. Adicionar na Fila Industrial (BullMQ) para processamento IA
     await incomingQueue.add(`msg_${dbConv.id}`, {
        message: { body: content, id: external_id },
        contact: dbContact,
        conversation: dbConv
     }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 }
     });
  }
};


