import React, { useState } from 'react';
import { 
  MessageSquare, 
  Settings, 
  Zap, 
  Smartphone, 
  Check, 
  Info, 
  ArrowRight,
  Flame,
  Volume2,
  Clock,
  ShieldCheck,
  Send,
  ShoppingBag
} from 'lucide-react';

function ViniBot() {
  const [activeTab, setActiveTab] = useState('atendimento'); // atendimento, pedidos, gatilhos
  const [mensagens, setMensagens] = useState({
    saudacao: "Olá {cliente}! Sou o Vini Bot 🌭. Que bom ter você aqui! Clique no link abaixo para ver nosso cardápio e fazer seu pedido:\n\n{link_cardapio}",
    confirmacao: "Pedido {pedido_id} recebido com sucesso! Já estamos aquecendo a chapa! 🔥",
    entrega: "Ótima notícia! Seu pedido {pedido_id} saiu para entrega com o motoboy {motoboy}. 🛵💨",
    fechado: "Olá! No momento estamos com as chamas apagadas 🌙. Mas amanhã voltamos com tudo! Você pode conferir nosso cardápio no link:\n{link_cardapio}"
  });

  const handleMsgChange = (key, val) => {
    setMensagens(prev => ({ ...prev, [key]: val }));
  };

  const renderPreview = (text) => {
    if (!text) return <div className="whatsapp-chat-bubble">Digitando...</div>;
    
    let formattedText = text
      .replace('{cliente}', 'Marcos')
      .replace('{pedido_id}', '#1024')
      .replace('{link_cardapio}', 'vinis.delivery/cardapio')
      .replace('{motoboy}', 'Ricardo');
      
    return (
      <div className="whatsapp-chat-bubble">
        <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{formattedText}</p>
        <span className="chat-time">17:45 <Check size={12} /></span>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'var(--c-red)', padding: '10px', borderRadius: '12px' }}>
            <Zap size={24} color="#fff" />
          </div>
          <div>
            <h2>Vini Bot (WhatsApp Automático) 🤖</h2>
            <p>Configuração de mensagens e automação de status de pedido.</p>
          </div>
        </div>
        <div className="vini-glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--c-green)' }}>
          <ShieldCheck size={18} color="var(--c-green)" />
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--c-green)' }}>ROBÔ CONECTADO</span>
        </div>
      </header>

      <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
        
        {/* LADO ESQUERDO: CONFIGURAÇÕES */}
        <div className="vini-glass-panel" style={{ padding: '2rem' }}>
          
          {/* TABS ESTILO ANOTA AI */}
          <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
             {['atendimento', 'pedidos', 'gatilhos'].map(tab => (
               <button 
                 key={tab} 
                 onClick={() => setActiveTab(tab)}
                 style={{ 
                   background: 'none', border: 'none', padding: '10px 5px', fontSize: '1rem', fontWeight: '800', cursor: 'pointer',
                   color: activeTab === tab ? 'var(--c-red)' : 'var(--text-muted)',
                   borderBottom: activeTab === tab ? '3px solid var(--c-red)' : '3px solid transparent',
                   textTransform: 'uppercase', letterSpacing: '1px'
                 }}
               >
                 {tab === 'atendimento' && <><MessageSquare size={16} /> Atendimento</>}
                 {tab === 'pedidos' && <><ShoppingBag size={16} /> Pedidos</>}
                 {tab === 'gatilhos' && <><Zap size={16} /> Gatilhos</>}
               </button>
             ))}
          </div>

          {/* CONTEÚDO DAS TABS */}
          {activeTab === 'atendimento' && (
            <div className="vini-bot-section animate-fade-in">
                <div style={{ marginBottom: '2rem' }}>
                   <label style={{ display: 'block', fontWeight: '700', marginBottom: '10px' }}>Mensagem de Saudação (Novo Cliente)</label>
                   <textarea 
                     className="vini-input-dark" 
                     style={{ width: '100%', height: '120px', padding: '15px', resize: 'none' }}
                     value={mensagens.saudacao}
                     onChange={(e) => handleMsgChange('saudacao', e.target.value)}
                   />
                   <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <span className="vini-tag" onClick={() => handleMsgChange('saudacao', mensagens.saudacao + ' {cliente}')}>+ {cliente}</span>
                      <span className="vini-tag" onClick={() => handleMsgChange('saudacao', mensagens.saudacao + ' {link_cardapio}')}>+ {link}</span>
                   </div>
                </div>

                <div style={{ padding: '15px', background: 'rgba(234, 29, 44, 0.05)', borderRadius: '12px', border: '1px dashed var(--c-red)' }}>
                   <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--c-red)' }}>Dica do Vini:</h4>
                   <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                     Use uma linguagem calorosa e direta. O objetivo é levar o cliente para o seu **cardápio digital** o mais rápido possível!
                   </p>
                </div>
            </div>
          )}

          {activeTab === 'pedidos' && (
            <div className="vini-bot-section animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                   <label style={{ display: 'block', fontWeight: '700', marginBottom: '10px' }}>Confirmação de Pedido Recebido</label>
                   <textarea 
                     className="vini-input-dark" 
                     style={{ width: '100%', height: '80px', padding: '15px' }}
                     value={mensagens.confirmacao}
                     onChange={(e) => handleMsgChange('confirmacao', e.target.value)}
                   />
                </div>
                <div>
                   <label style={{ display: 'block', fontWeight: '700', marginBottom: '10px' }}>Notificação de "Saiu para Entrega" 🛵</label>
                   <textarea 
                     className="vini-input-dark" 
                     style={{ width: '100%', height: '80px', padding: '15px' }}
                     value={mensagens.entrega}
                     onChange={(e) => handleMsgChange('entrega', e.target.value)}
                   />
                </div>
            </div>
          )}

          <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
             <button className="vini-btn-outline">Restaurar Padrão</button>
             <button className="btn vini-btn-primary" style={{ padding: '12px 30px' }}>Salvar Automação</button>
          </div>
        </div>

        {/* LADO DIREITO: PREVIEW SMARTPHONE */}
        <div style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
          <div className="iphone-mockup">
             <div className="iphone-screen">
                <div className="whatsapp-header">
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src="/Logo-VINI.png" alt="Vini" style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff' }} />
                      <div>
                         <div style={{ fontWeight: '700', fontSize: '13px', color: '#fff' }}>Vini's Delivery 🌭</div>
                         <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>online</div>
                      </div>
                   </div>
                </div>
                
                <div className="whatsapp-body">
                   <div className="chat-day">HOJE</div>
                   {renderPreview(activeTab === 'atendimento' ? mensagens.saudacao : (activeTab === 'pedidos' ? mensagens.entrega : mensagens.saudacao))}
                </div>

                <div className="whatsapp-footer">
                   <div className="chat-input-mock">Digite uma mensagem...</div>
                   <div className="chat-mic"><Send size={16} color="#fff" /></div>
                </div>
             </div>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
             <Smartphone size={14} /> Preview Real-time do Robô
          </p>
        </div>

      </div>

      <style>{`
        .vini-tag {
          background: rgba(255,255,255,0.05);
          padding: 4px 10px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 0.8rem;
          cursor: pointer;
          border: 1px solid var(--border-color);
        }
        .vini-tag:hover { background: var(--c-red); border-color: var(--c-red); }

        .iphone-mockup {
          width: 320px;
          height: 640px;
          background: #000;
          border-radius: 45px;
          padding: 12px;
          border: 6px solid #333;
          box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5);
          margin: 0 auto;
        }
        .iphone-screen {
          width: 100%;
          height: 100%;
          background: #0b141a;
          border-radius: 35px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .whatsapp-header { 
          padding: 40px 20px 15px; 
          background: #202c33; 
          display: flex; 
          align-items: center; 
        }
        .whatsapp-body {
          flex: 1;
          padding: 15px;
          background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
          background-size: cover;
          display: flex;
          flex-direction: column;
        }
        .chat-day {
          align-self: center;
          background: #182229;
          color: rgba(255,255,255,0.6);
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 10px;
          margin-bottom: 15px;
        }
        .whatsapp-chat-bubble {
          align-self: flex-start;
          max-width: 85%;
          background: #202c33;
          color: #e9edef;
          padding: 8px 10px 15px;
          border-radius: 0 8px 8px 8px;
          font-size: 13px;
          line-height: 1.4;
          position: relative;
          box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
        }
        .chat-time {
          position: absolute;
          bottom: 4px;
          right: 7px;
          font-size: 9px;
          color: rgba(255,255,255,0.4);
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .whatsapp-footer {
          padding: 10px;
          background: #202c33;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .chat-input-mock {
          flex: 1;
          background: #2a3942;
          color: rgba(255,255,255,0.4);
          padding: 10px 15px;
          border-radius: 20px;
          font-size: 12px;
        }
        .chat-mic {
          width: 38px;
          height: 38px;
          background: #00a884;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

export default ViniBot;
