import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Search, 
  MoreVertical, 
  Send, 
  User, 
  ShoppingBag, 
  CreditCard, 
  FileText, 
  Zap, 
  Loader2,
  RefreshCw,
  Clock,
  ChevronRight,
  Filter,
  CheckCheck,
  Video,
  Phone,
  X,
  Scale,
  UtensilsCrossed,
  AlertTriangle,
  Wifi,
  MoreHorizontal,
  Gavel
} from 'lucide-react';
import { io } from 'socket.io-client';
import { supabase } from '../lib/supabaseClient';

const SOCKET_URL = 'http://localhost:3001';

function ViniBot() {
  const [conversations, setConversations] = useState([
     { id: 1, name: 'Cliente Jurídico', phone: '+55 11 99999-9999', type: 'legal', lastMsg: '15:20', status: 'A', avatarBg: 'bg-emerald-100 text-emerald-700' },
     { id: 2, name: 'Cliente Alimentício', phone: '+55 11 88888-8888', type: 'food', lastMsg: '17:32', status: '!', avatarBg: 'bg-orange-100 text-orange-700' },
     { id: 3, name: 'Cobrança Pend.', phone: '+55 11 77777-7777', type: 'billing', lastMsg: '16:30', avatarBg: 'bg-blue-100 text-blue-700' },
     { id: 4, name: 'Cobrança', phone: '+55 11 66666-6666', type: 'billing', lastMsg: '16:49', avatarBg: 'bg-emerald-100 text-emerald-700' },
  ]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [botStatus, setBotStatus] = useState('CONNECTED');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  
  const scrollRef = useRef();
  const socketRef = useRef();

  useEffect(() => {
    // Socket logic
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('bot-status', (data) => {
      setBotStatus(data.status);
      if (data.data) setQrCodeData(data.data);
    });
    return () => socketRef.current.disconnect();
  }, []);

  return (
    <div className="flex h-screen bg-[#1a1c1e] text-[#e3e2e6] overflow-hidden p-2">
      
      {/* APP CONTAINER - DARK INDUSTRIAL THEME */}
      <div className="flex w-full h-full bg-[#202123] rounded-2xl border border-[#303134] shadow-2xl overflow-hidden">
        
        {/* COLUMN 1: SIDEBAR (CONTACTS) */}
        <div className="w-[300px] border-r border-[#303134] flex flex-col bg-[#111214]">
          <header className="p-4 flex items-center gap-3 border-b border-[#303134]">
             <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center overflow-hidden">
                <User size={24} color="#fff" />
             </div>
             <div>
                <h1 className="text-sm font-bold leading-tight">ViniBot <span className="text-emerald-400">PRO</span></h1>
                <p className="text-[10px] text-gray-400">Atendimento Inteligente</p>
             </div>
             <div className="ml-auto flex gap-3 text-gray-400">
                <Video size={16} />
                <Phone size={16} />
                <MoreHorizontal size={16} />
                <X size={16} />
             </div>
          </header>

          <div className="p-3">
             <div className="bg-[#202123] rounded-full flex items-center px-3 py-1.5 gap-2 border border-[#3c4043]">
                <Search size={16} className="text-gray-500" />
                <input type="text" placeholder="Buscar..." className="bg-transparent text-xs outline-none w-full" />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto">
             {conversations.map(c => (
               <div key={c.id} className="flex items-center p-3 hover:bg-[#202123] cursor-pointer transition-colors border-b border-[#202123]">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${c.avatarBg}`}>
                     {c.type === 'legal' && <Scale size={18} />}
                     {c.type === 'food' && <UtensilsCrossed size={18} />}
                     {c.type === 'billing' && <CreditCard size={18} />}
                  </div>
                  <div className="ml-3 flex-1 overflow-hidden">
                     <div className="flex justify-between items-center mb-0.5">
                        <span className="text-xs font-bold truncate">{c.name}</span>
                        <span className="text-[10px] text-gray-500">{c.lastMsg}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="h-1 flex-1 bg-[#3c4043] rounded-full">
                           <div className="h-full bg-emerald-500 rounded-full w-[60%]"></div>
                        </div>
                        {c.status && (
                           <span className={`text-[9px] font-bold px-1 rounded ${c.status === '!' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'}`}>
                              {c.status}
                           </span>
                        )}
                     </div>
                  </div>
               </div>
             ))}
          </div>

          <div className="p-4 mt-auto border-t border-[#303134]">
             <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all mb-4">
                Iniciar Novo Atendimento
             </button>
             <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold px-1">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                   Online | Multi-sessão SaaS
                </div>
                <Wifi size={14} />
             </div>
          </div>
        </div>

        {/* COLUMN 2: CHAT AREA */}
        <div className="flex-1 flex flex-col bg-[#131416] relative transition-all">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"></div>

          <header className="h-[60px] bg-[#1a1c1e] bg-opacity-80 backdrop-blur-md flex items-center px-4 border-b border-[#303134] z-10">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                   <User size={18} color="#fff" />
                </div>
                <div>
                   <h3 className="text-xs font-bold">Cliente Jurídico</h3>
                   <p className="text-[9px] text-emerald-400">em atendimento via IA</p>
                </div>
             </div>
             <div className="ml-auto flex gap-4 text-gray-400">
                <Search size={18} />
                <MoreVertical size={18} />
             </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 z-10 flex flex-col gap-4">
             
             {/* QR Connection Prompt */}
             <div className="self-center w-full max-w-sm bg-[#1a1c1e] rounded-xl border border-[#303134] p-4 shadow-xl mb-6">
                <div className="flex gap-4">
                   <div className="bg-white p-2 rounded-lg">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=vinibot-pro" alt="QR" className="w-[100px] h-[100px]" />
                   </div>
                   <div className="flex-1">
                      <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                        <Wifi size={14} className="text-emerald-400" /> Conecte-se ao WhatsApp
                      </h4>
                      <p className="text-[10px] text-gray-400 leading-relaxed">Escaneie o QR Code para ativar o motor e sincronizar as conversas.</p>
                   </div>
                </div>
             </div>

             <div className="self-start bg-[#1a1c1e] text-[#e3e2e6] px-4 py-2 rounded-2xl rounded-tl-none border border-[#303134] max-w-[80%]">
                <div className="flex items-center gap-2 mb-1">
                   <Zap size={12} className="text-emerald-400" />
                   <span className="text-[10px] font-bold text-emerald-400">ViniBot AI</span>
                   <span className="text-[9px] text-gray-500 ml-auto">10:48</span>
                </div>
                <p className="text-[11px]">Olá! Como posso ajudar você hoje?</p>
             </div>

             <div className="self-end bg-emerald-900 border border-emerald-800 text-white px-4 py-2 rounded-2xl rounded-tr-none max-w-[80%]">
                <div className="flex items-center justify-between mb-1">
                   <span className="text-[10px] font-bold opacity-70">Cliente Jurídico</span>
                   <span className="text-[9px] opacity-50 ml-6">10:48</span>
                </div>
                <p className="text-[11px]">Quero um Hot Dog</p>
             </div>

             {/* RICH ORDER BUBBLE */}
             <div className="self-start bg-[#1a1c1e] border border-[#303134] rounded-2xl rounded-tl-none overflow-hidden max-w-[80%] shadow-lg">
                <div className="p-3">
                   <p className="text-[11px] mb-3">Pedido gerado! Clique para revisar:</p>
                   <div className="bg-[#202123] rounded-lg p-2 border border-[#3c4043] flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-md overflow-hidden p-1">
                         <img src="https://images.unsplash.com/photo-1541232390620-8a8400a9c24d?auto=format&fit=crop&q=80&w=100&h=100" alt="Hot dog" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                         <h5 className="text-[10px] font-bold">Hot Dog Especial</h5>
                         <p className="text-[10px] text-emerald-400 font-bold">Total: R$ 15,00</p>
                      </div>
                      <button className="bg-emerald-600 text-white text-[9px] px-3 py-1.5 rounded-md font-bold">Ver Pedido</button>
                   </div>
                </div>
                <div className="bg-[#111214] border-t border-[#303134] px-3 py-1 flex justify-between">
                   <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Sincronizado</span>
                   <span className="text-[9px] text-gray-500">10:48 <CheckCheck size={12} className="inline ml-1" /></span>
                </div>
             </div>

             {/* PAYMENT NOTIFICATION */}
             <div className="self-center bg-[#1a1c1e]/50 backdrop-blur-sm border border-emerald-900 text-emerald-400 px-4 py-2 rounded-xl text-center text-[10px] max-w-[90%]">
                <span className="font-bold">Pagamento aprovado! 🥳 Link do PIX enviado! ✅</span>
                <span className="block underline opacity-70 mt-1 cursor-pointer">https://asaas.com.br/p/sR4X8K7</span>
             </div>

          </div>

          <footer className="bg-[#1a1c1e] p-3 flex items-center gap-3 border-t border-[#303134] z-10">
             <div className="w-8 h-8 rounded-full bg-[#202123] flex items-center justify-center text-gray-400 cursor-pointer">
                <RefreshCw size={16} />
             </div>
             <div className="flex-1 bg-[#202123] rounded-full px-4 py-2 border border-[#3c4043] flex items-center">
                <input type="text" placeholder="Digite uma mensagem..." className="bg-transparent text-xs outline-none w-full" />
                <RefreshingIcon size={16} className="text-gray-500" />
             </div>
             <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Send size={20} />
             </div>
          </footer>
        </div>

        {/* COLUMN 3: ACTIONS & METRICS PANEL */}
        <div className="w-[300px] border-l border-[#303134] bg-[#111214] flex flex-col p-4">
           
           <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <UtensilsCrossed size={12} className="text-emerald-400" /> Pedidos Alimentícios
                 </h4>
                 <MoreHorizontal size={14} className="text-gray-600" />
              </div>
              <div className="bg-[#1a1c1e] rounded-xl border border-[#303134] p-3 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center border border-[#3c4043]">
                    <img src="https://images.unsplash.com/photo-1541232390620-8a8400a9c24d?auto=format&fit=crop&q=80&w=64&h=64" alt="Food" className="w-full h-full object-cover" />
                 </div>
                 <button className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all">
                    Criar Pedido
                 </button>
              </div>
           </div>

           <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={12} className="text-[#f59e0b]" /> Documentos Jurídicos
                 </h4>
                 <MoreHorizontal size={14} className="text-gray-600" />
              </div>
              <div className="bg-[#1a1c1e] rounded-xl border border-[#303134] p-3 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-[#202123] flex items-center justify-center border border-[#3c4043]">
                    <Gavel size={20} className="text-gray-400" />
                 </div>
                 <button className="flex-1 py-2 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg text-xs font-bold transition-all">
                    Gerar Contrato
                 </button>
              </div>
           </div>

           <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard size={12} className="text-emerald-400" /> Cobrança Financeira
                 </h4>
                 <MoreHorizontal size={14} className="text-gray-600" />
              </div>
              <div className="bg-[#1a1c1e] rounded-xl border border-[#303134] p-3 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-[#3c4043]">
                    <CreditCard size={20} className="text-[#00c9ff]" />
                 </div>
                 <button className="flex-1 py-2 bg-[#ea1d2c] hover:bg-[#c41523] text-white rounded-lg text-xs font-bold transition-all">
                    Cobrar via PIX
                 </button>
              </div>
           </div>

           <div className="mt-auto bg-[#1a1c1e] rounded-xl border border-[#303134] p-4">
              <div className="space-y-3">
                 <div className="flex justify-between items-center border-b border-[#303134] pb-2">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">IA Ativa: <span className="text-emerald-400 italic font-medium ml-1">GPT-4o</span></span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Sessão: <span className="text-red-400 font-bold ml-1 flex items-center gap-1">Redis <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div></span></span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Tickets Abertos: <span className="text-white ml-1">5</span></span>
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Tempo SLA: <span className="text-white ml-1">00:12:30</span></span>
                 </div>
              </div>
           </div>

        </div>

      </div>

    </div>
  );
}

// Utility to handle icons/styles for the send area
function RefreshingIcon({ size, className }) {
   return (
      <div className={`${className} animate-pulse`}>
         <MessageSquare size={size} />
      </div>
   );
}

export default ViniBot;

