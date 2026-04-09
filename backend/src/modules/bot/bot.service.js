import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion, 
  makeCacheableSignalKeyStore 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../../config/database.js';
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

     try {
        // 0. Idempotência: Verificar se mensagem já foi processada
        const [existing] = await query(
           'SELECT id FROM whatsapp_messages WHERE external_id = ? LIMIT 1',
           [external_id]
        );
        if (existing) return;

        // 1. Sincronizar Contato (UPSERT manual MySQL)
        let dbContact;
        const [contact] = await query('SELECT id FROM whatsapp_contacts WHERE phone = ? LIMIT 1', [phone]);
        
        if (contact) {
           await query(
              'UPDATE whatsapp_contacts SET name = ?, pushname = ?, updated_at = NOW() WHERE id = ?',
              [msg.pushName || phone, msg.pushName, contact.id]
           );
           dbContact = { id: contact.id, phone, name: msg.pushName || phone };
        } else {
           const newContactId = uuidv4();
           await query(
              'INSERT INTO whatsapp_contacts (id, phone, name, pushname) VALUES (?, ?, ?, ?)',
              [newContactId, phone, msg.pushName || phone, msg.pushName]
           );
           dbContact = { id: newContactId, phone, name: msg.pushName || phone };
        }

        // 2. Sincronizar Conversa (UPSERT manual MySQL)
        let dbConv;
        const [conv] = await query('SELECT id FROM whatsapp_conversations WHERE contact_id = ? LIMIT 1', [dbContact.id]);
        
        if (conv) {
           await query(
              'UPDATE whatsapp_conversations SET last_message_at = NOW(), updated_at = NOW() WHERE id = ?',
              [conv.id]
           );
           dbConv = { id: conv.id };
        } else {
           const newConvId = uuidv4();
           await query(
              'INSERT INTO whatsapp_conversations (id, contact_id, last_message_at) VALUES (?, ?, NOW())',
              [newConvId, dbContact.id]
           );
           dbConv = { id: newConvId };
        }

        // 3. Salvar Mensagem (INBOUND)
        const newMsgId = uuidv4();
        await query(
           'INSERT INTO whatsapp_messages (id, conversation_id, external_id, sender, direction, content) VALUES (?, ?, ?, ?, ?, ?)',
           [newMsgId, dbConv.id, external_id, 'user', 'IN', content]
        );

        const dbMsg = {
           id: newMsgId,
           conversation_id: dbConv.id,
           external_id,
           sender: 'user',
           direction: 'IN',
           content,
           created_at: new Date()
        };

        // 4. Emitir via Socket para a UI
        if (io) {
           io.to(`conversation_${dbConv.id}`).emit('new-message', dbMsg);
           io.emit('chat-update', { id: dbConv.id, lastMsg: content });
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

     } catch (err) {
        console.error('❌ [processIncomingMessage Error]:', err.message);
     }
  }
};



