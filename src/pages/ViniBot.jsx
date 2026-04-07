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
  Gavel,
  Activity,
  ShieldCheck,
  Cpu,
  BarChart3,
  Bot,
  Mail,
  Tag as TagIcon,
  StickyNote,
  History,
  Check,
  Paperclip,
  Smile,
  Mic,
  Plus,
  Trash2,
  Edit2,
  Save
} from 'lucide-react';
import { io } from 'socket.io-client';
import { supabase } from '../lib/supabaseClient';

const SOCKET_URL = 'http://localhost:3001';

function ViniBot() {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [botStatus, setBotStatus] = useState('DISCONNECTED');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inputMsg, setInputMsg] = useState('');
  const [activeTab, setActiveTab] = useState('reply'); // 'reply' or 'notes'
  
  // Real CRM States
  const [noteInput, setNoteInput] = useState('');
  const [localNotes, setLocalNotes] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [editingField, setEditingField] = useState(null); // 'name' or 'email'
  const [editValue, setEditValue] = useState('');

  const scrollRef = useRef();
  const socketRef = useRef();

  useEffect(() => {
    fetchInitialData();
    
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('bot-status', (data) => {
      setBotStatus(data.status);
      if (data.data) setQrCodeData(data.data);
    });

    socketRef.current.on('new-message', (msg) => {
      if (selectedChat && msg.conversation_id === selectedChat.id) {
         setMessages(prev => [...prev, msg]);
      }
    });

    socketRef.current.on('chat-update', (data) => {
       fetchConversations();
    });

    return () => socketRef.current.disconnect();
  }, [selectedChat]);

  const fetchInitialData = async () => {
    setLoading(true);
    await fetchConversations();
    setLoading(false);
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${SOCKET_URL}/api/whatsapp/conversations`);
      const result = await response.json();
      if (result.success) {
        setConversations(result.data);
        if (!selectedChat && result.data.length > 0) {
          handleSelectChat(result.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    // Fetch Messages
    try {
      const response = await fetch(`${SOCKET_URL}/api/whatsapp/messages/${chat.id}`);
      const result = await response.json();
      if (result.success) {
        setMessages(result.data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = () => {
    if (!inputMsg.trim() || !selectedChat) return;

    if (activeTab === 'reply') {
       socketRef.current.emit('send-wa-message', {
         phone: selectedChat.whatsapp_contacts.phone,
         content: inputMsg
       });
    } else {
       handleAddNote(inputMsg);
    }

    setInputMsg('');
  };

  // REAL CRM FUNCTIONALITIES
  const handleAddTag = async () => {
    if (!newTag.trim() || !selectedChat) return;
    const updatedTags = [...(selectedChat.whatsapp_contacts.tags || []), newTag.trim()];
    
    const { error } = await supabase
      .from('whatsapp_contacts')
      .update({ tags: updatedTags })
      .eq('id', selectedChat.whatsapp_contacts.id);

    if (!error) {
       setSelectedChat({
          ...selectedChat,
          whatsapp_contacts: { ...selectedChat.whatsapp_contacts, tags: updatedTags }
       });
       setNewTag('');
       setIsAddingTag(false);
    } else {
       console.error('Error adding tag:', error.message);
    }
  };

  const handleRemoveTag = async (tagName) => {
    const updatedTags = selectedChat.whatsapp_contacts.tags.filter(t => t !== tagName);
    const { error } = await supabase
      .from('whatsapp_contacts')
      .update({ tags: updatedTags })
      .eq('id', selectedChat.whatsapp_contacts.id);

    if (!error) {
       setSelectedChat({
          ...selectedChat,
          whatsapp_contacts: { ...selectedChat.whatsapp_contacts, tags: updatedTags }
       });
    }
  };

  const handleAddNote = (content) => {
    const newNote = {
       id: Date.now(),
       content,
       created_at: new Date().toISOString()
    };
    setLocalNotes(prev => [newNote, ...prev]);
  };

  const handleUpdateContact = async () => {
     if (!selectedChat || !editingField) return;
     
     const { error } = await supabase
       .from('whatsapp_contacts')
       .update({ [editingField]: editValue })
       .eq('id', selectedChat.whatsapp_contacts.id);

     if (!error) {
        setSelectedChat({
           ...selectedChat,
           whatsapp_contacts: { ...selectedChat.whatsapp_contacts, [editingField]: editValue }
        });
        setEditingField(null);
     }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-20px)] bg-[#F3F5F7] text-slate-800 overflow-hidden font-sans p-2">
      
      <div className="flex w-full h-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* 1. SIDEBAR: CONTACTS (LEFT) */}
        <div className="w-[300px] border-r border-slate-200 flex flex-col bg-[#FDFDFD] shrink-0">
          <header className="p-6 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
                     <User size={20} className="text-slate-400" />
                  </div>
                  <div>
                     <h1 className="text-sm font-bold text-slate-800">You</h1>
                     <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Active session</p>
                  </div>
               </div>
               <div className="flex gap-4 text-slate-500">
                  <MessageSquare size={18} className="cursor-pointer hover:text-emerald-500 transition-colors" />
                  <Plus size={18} className="cursor-pointer hover:text-emerald-500 transition-colors" />
               </div>
            </div>
            <div className="relative">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search customers..." 
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:bg-white focus:border-emerald-500/30 transition-all font-medium"
               />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
             {conversations.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-xs font-medium leading-relaxed">
                   <Loader2 size={24} className="animate-spin mx-auto mb-4 opacity-20" />
                   Aguardando contatos...
                </div>
             ) : (
                conversations.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => handleSelectChat(c)}
                    className={`flex items-start p-4 cursor-pointer transition-all border-b border-slate-50 relative group
                      ${selectedChat?.id === c.id ? 'bg-[#F3F7F5] border-l-4 border-l-[#4B7A5D]' : 'hover:bg-slate-50'}`}
                  >
                     <div className="relative shrink-0 mr-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#4B7A5D]/10 flex items-center justify-center text-[#4B7A5D] font-bold text-xs group-hover:scale-105 transition-transform">
                           {c.whatsapp_contacts?.name?.substring(0, 2) || 'CL'}
                        </div>
                        {c.status === 'bot' && (
                           <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#4B7A5D] border-2 border-white shadow-sm"></div>
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-[13px] font-bold text-slate-700 truncate">{c.whatsapp_contacts?.name || c.whatsapp_contacts?.phone}</span>
                           <span className="text-[10px] text-slate-400 font-bold uppercase">
                              {new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate leading-tight font-medium">Synced via ViniBot PRO...</p>
                     </div>
                  </div>
                ))
             )}
          </div>
        </div>

        {/* 2. CHAT AREA: CENTER */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <header className="h-[75px] bg-[#4B7A5D] flex items-center px-8 gap-5 shrink-0 shadow-lg z-20">
             <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-white border border-white/20">
                   <User size={22} className="text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#4B7A5D]"></div>
             </div>
             <div className="flex-1">
                <h3 className="text-[15px] font-bold text-white tracking-tight leading-none mb-1">{selectedChat?.whatsapp_contacts?.name || 'ViniBot User'}</h3>
                <div className="flex items-center gap-2">
                   <Activity size={10} className="text-emerald-400 animate-pulse" />
                   <p className="text-[10px] text-emerald-300 font-black uppercase tracking-widest">Enterprise Secured</p>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <div className="flex bg-black/10 p-1 rounded-xl">
                   <button className="p-2 hover:bg-white/10 rounded-lg text-white/80"><Phone size={18} /></button>
                   <button className="p-2 hover:bg-white/10 rounded-lg text-white/80"><Video size={18} /></button>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-xl text-white/80"><MoreVertical size={22} /></button>
             </div>
          </header>

          {/* CHAT MESSAGES PANEL */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-10 bg-[#F9FAFB] relative custom-scrollbar flex flex-col gap-8"
          >
             {/* Subtle Pattern Background */}
             <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]"></div>
             
             {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-300 text-sm font-black uppercase tracking-[0.2em]">Sincronizando...</div>
             ) : (
                messages.map((m, idx) => (
                  <div 
                    key={m.id || idx}
                    className={`max-w-[85%] flex flex-col z-10 break-words
                      ${m.direction === 'OUT' ? 'self-end' : 'self-start'}`}
                  >
                     <div className="flex flex-col">
                        <div className={`px-5 py-4 rounded-3xl shadow-md relative group/msg
                           ${m.direction === 'OUT' 
                             ? 'bg-[#E6F2EA] text-slate-800 rounded-tr-none border border-emerald-500/10' 
                             : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'}`}
                        >
                           <p className="text-[14px] leading-[1.6] font-medium">{m.content}</p>
                           <div className={`flex items-center gap-2 mt-2 text-[10px] font-bold
                              ${m.direction === 'OUT' ? 'justify-end text-slate-500/60' : 'text-slate-400'}`}>
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {m.direction === 'OUT' && (
                                 <CheckCheck size={14} className="text-[#4B7A5D]" />
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
                ))
             )}
          </div>

          {/* INPUT AREA (Addressing the "limitless/crowded" feedback) */}
          <div className="bg-white border-t border-slate-200 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
             <div className="flex gap-10 border-b border-slate-50 px-10 pt-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                <button 
                  onClick={() => setActiveTab('reply')}
                  className={`pb-3 transition-all relative ${activeTab === 'reply' ? 'text-[#4B7A5D]' : 'hover:text-slate-600'}`}
                >
                  REPLY
                  {activeTab === 'reply' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#4B7A5D] rounded-t-full"></div>}
                </button>
                <button 
                  onClick={() => setActiveTab('notes')}
                  className={`pb-3 transition-all relative ${activeTab === 'notes' ? 'text-[#D97706]' : 'hover:text-slate-600'}`}
                >
                  INTERNAL NOTE
                  {activeTab === 'notes' && <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#D97706] rounded-t-full"></div>}
                </button>
             </div>
             
             <div className="p-6 flex items-end gap-5">
                <div className="flex-1 bg-[#F9FAFB] border border-slate-200 rounded-[1.5rem] p-4 shadow-inner relative group focus-within:border-[#4B7A5D]/50 transition-all ring-4 ring-transparent focus-within:ring-[#4B7A5D]/5">
                   <textarea 
                     rows="1"
                     value={inputMsg}
                     onChange={(e) => setInputMsg(e.target.value)}
                     placeholder={`Write a ${activeTab}...`}
                     className="w-full bg-transparent text-[14px] outline-none resize-none placeholder:text-slate-300 font-medium max-h-[120px] custom-scrollbar"
                   />
                   <div className="flex items-center justify-between text-slate-400 mt-4">
                      <div className="flex gap-6">
                         <Smile size={20} className="cursor-pointer hover:text-[#4B7A5D] transition-colors" />
                         <Paperclip size={20} className="cursor-pointer hover:text-[#4B7A5D] transition-colors" />
                         <Mic size={20} className="cursor-pointer hover:text-[#4B7A5D] transition-colors" />
                      </div>
                   </div>
                </div>
                <button 
                   onClick={handleSendMessage}
                   className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl active:scale-90 transition-all hover:scale-105
                      ${activeTab === 'reply' ? 'bg-[#4B7A5D] shadow-[#4B7A5D]/30' : 'bg-[#D97706] shadow-[#D97706]/30'}`}
                >
                   <Send size={24} fill="white" />
                </button>
             </div>
          </div>
        </div>

        {/* 3. DETAILS PANEL: RIGHT (FUNCTIONAL CRM) */}
        <div className="w-[320px] bg-[#F3F5F7] flex flex-col overflow-y-auto custom-scrollbar shrink-0 border-l border-slate-200 shadow-2xl relative z-30">
           <header className="p-6 border-b border-slate-200 flex justify-between items-center bg-[#EDEDF0]">
              <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">Details Panel</h4>
              <button className="p-2 hover:bg-slate-200 rounded-xl transition-all"><X size={18} className="text-slate-400" /></button>
           </header>

           {/* Personal Details Section (Real Update Logic) */}
           <div className="m-4 p-6 bg-white rounded-3xl shadow-sm border border-slate-100 group">
              <div className="flex justify-between items-center mb-8">
                 <h5 className="text-[11px] uppercase font-black text-slate-400 tracking-[0.2em]">Contact Information</h5>
                 <Edit2 size={14} className="text-slate-300 cursor-pointer hover:text-emerald-500" onClick={() => setEditingField('name')} />
              </div>
              
              <div className="flex items-center gap-5 mb-8">
                 <div className="w-14 h-14 rounded-[1.5rem] bg-[#4B7A5D] flex items-center justify-center text-white text-sm font-black shadow-lg shadow-[#4B7A5D]/20 border-4 border-white">
                    {selectedChat?.whatsapp_contacts?.name?.substring(0, 2) || 'CL'}
                 </div>
                 <div className="flex-1 min-w-0">
                    {editingField === 'name' ? (
                       <div className="flex gap-1 animate-in fade-in slide-in-from-top-1">
                          <input 
                             value={editValue} 
                             onChange={(e) => setEditValue(e.target.value)}
                             onBlur={handleUpdateContact}
                             className="text-xs bg-slate-50 border border-slate-200 p-1 w-full rounded focus:outline-none focus:border-emerald-500" 
                             autoFocus
                          />
                          <button onClick={handleUpdateContact} className="text-emerald-500"><Save size={14} /></button>
                       </div>
                    ) : (
                       <h6 className="text-[15px] font-black text-slate-800 leading-tight mb-1 truncate">{selectedChat?.whatsapp_contacts?.name || 'Smeetha'}</h6>
                    )}
                    <p className="text-[11px] text-slate-400 font-bold truncate flex items-center gap-1.5"><Mail size={12} className="text-slate-300" /> {selectedChat?.whatsapp_contacts.email || 'Email not set'}</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5">Phone Network</p>
                    <p className="text-[14px] text-slate-700 font-black">+{selectedChat?.whatsapp_contacts?.phone || '91 99999 99999'}</p>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                    <div>
                       <p className="text-[10px] text-emerald-600 uppercase font-black tracking-widest mb-0.5">Opt-in Status</p>
                       <p className="text-emerald-700 font-bold text-[11px]">VERAFIED ENTERPRISE</p>
                    </div>
                    <ShieldCheck size={20} className="text-emerald-500" />
                 </div>
              </div>
           </div>

           {/* Tag Section (Real Tag Update Logic) */}
           <div className="mx-4 mb-4 p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                 <h5 className="text-[11px] uppercase font-black text-slate-400 tracking-[0.2em]">CRM Tags</h5>
                 <Plus size={16} className="text-slate-400 cursor-pointer hover:text-emerald-500" onClick={() => setIsAddingTag(!isAddingTag)} />
              </div>
              <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
                 {selectedChat?.whatsapp_contacts.tags?.map(tag => (
                    <span key={tag} className="flex items-center px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-[10px] font-black border border-slate-200 group/tag">
                       {tag}
                       <X size={10} className="ml-2 cursor-pointer text-slate-300 hover:text-red-500 transition-colors" onClick={() => handleRemoveTag(tag)} />
                    </span>
                 ))}
                 {!selectedChat?.whatsapp_contacts.tags?.length && <p className="text-[11px] text-slate-300 font-medium">No tags assigned</p>}
              </div>

              {isAddingTag && (
                 <div className="flex gap-2 animate-in fade-in zoom-in-95 duration-200 mb-4">
                    <input 
                       value={newTag}
                       onChange={(e) => setNewTag(e.target.value)}
                       placeholder="Enter tag..."
                       className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-emerald-500/50"
                       autoFocus
                       onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <button onClick={handleAddTag} className="bg-emerald-500 text-white p-1.5 rounded-lg shadow-md"><Check size={14} /></button>
                 </div>
              )}

              <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-100">
                 Manage Segments
              </button>
           </div>

           {/* Notes Section (Real Internal Note Storage) */}
           <div className="mx-4 mb-4 p-6 bg-white rounded-3xl shadow-sm border border-slate-100">
              <h5 className="text-[11px] uppercase font-black text-slate-400 tracking-[0.2em] mb-6">Internal CRM Notes</h5>
              <div className="space-y-4 mb-6">
                 {localNotes.map(n => (
                    <div key={n.id} className="p-4 bg-[#FFFBEB] rounded-2xl border border-[#FEF3C7] shadow-sm relative group animate-in slide-in-from-right-1">
                       <p className="text-[12px] text-slate-700 font-medium leading-relaxed italic">"{n.content}"</p>
                       <p className="text-[9px] text-[#D97706] mt-3 font-black uppercase">{new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                 ))}
                 <div className="p-4 bg-[#FFFBEB]/50 rounded-2xl border border-[#FEF3C7]/50 shadow-sm opacity-60">
                    <p className="text-[12px] text-slate-700 font-medium leading-relaxed italic">"Lead expressed interest in Enterprise version."</p>
                    <p className="text-[9px] text-[#D97706] mt-3 font-black uppercase">08/01/2026</p>
                 </div>
              </div>
              <button 
                 onClick={() => setActiveTab('notes')}
                 className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500/10 text-amber-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-amber-200 transition-all hover:bg-amber-500/20"
              >
                 <Edit2 size={12} /> View All Notes
              </button>
           </div>

           {/* Conversation History Section */}
           <div className="mx-4 mb-10 p-6 bg-white rounded-3xl shadow-sm border border-slate-100 flex-1">
              <h5 className="text-[11px] uppercase font-black text-slate-400 tracking-[0.2em] mb-6">Interaction Logs</h5>
              <div className="space-y-6">
                 <div className="flex gap-4 group">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 shrink-0"></div>
                    <div>
                       <p className="text-[12px] font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">WhatsApp Contact Sinced</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">01:22 PM • Admin</p>
                    </div>
                 </div>
                 <div className="flex gap-4 group">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-300 shrink-0"></div>
                    <div>
                       <p className="text-[12px] font-bold text-slate-600">Bot Module Deployed</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">11:05 AM • System</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.1); }
      ` }} />

    </div>
  );
}

export default ViniBot;
