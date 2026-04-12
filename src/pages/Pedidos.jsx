import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  ShoppingBag, Clock, CheckCircle2, AlertCircle, 
  Search, Plus, X, Printer, CreditCard, ClipboardList,
  Store, Bike, Map as MapIcon, Settings, ExternalLink,
  ChefHat, Truck, MessageCircle, Phone, User, QrCode
} from 'lucide-react';
import { useCaixa } from '../context/CaixaContext';
import AbrirCaixaModal from '../components/caixa/AbrirCaixaModal';
import '../styles/admin/pdv.css';
import { useNavigate } from 'react-router-dom';

function Pedidos() {
  const { sessaoAtiva, abrirSessao } = useCaixa();
  const [activeTab, setActiveTab] = useState('pedidos');
  const [isAbrirModalOpen, setIsAbrirModalOpen] = useState(false);
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const lastOrderCount = useRef(0);

  const fetchOrders = async () => {
    try {
      const resp = await api.get('/orders');
      if (resp.success) {
        const data = resp.data || [];
        if (data.length > lastOrderCount.current && lastOrderCount.current !== 0) {
          handleNewOrderAlert(data[0]);
        }
        setOrdersList(data);
        lastOrderCount.current = data.length;
        
        // Auto-select first order if none selected
        if (!selectedOrder && data.length > 0) {
          setSelectedOrder(data[0]);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNewOrderAlert = (order) => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => {});
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.success) {
        // Refresh local list
        setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === orderId) {
           setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar status');
    }
  };

  // --- RENDERS ---

  const renderPedidosView = () => (
    <div className="pdv-main-layout">
      {/* Sidebar de Lista de Pedidos */}
      <aside className="kanban-vertical-sidebar">
        <div className="sidebar-search">
           <div className="search-input-wrapper">
             <Search size={16} color="#aaa" />
             <input 
               type="text" 
               placeholder="Busca" 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>

        <div className="sidebar-orders-list">
          {['novos', 'preparo', 'entrega'].map(status => {
            const filtered = ordersList.filter(o => o.status === status);
            if (filtered.length === 0 && status !== 'novos') return null;

            return (
              <div key={status} className="status-group">
                <div className="category-group-header">
                  <span>{status === 'novos' ? 'EM PRODUÇÃO' : status === 'preparo' ? 'PRONTOS' : 'EM ENTREGA'}</span>
                  <span>{filtered.length}</span>
                </div>
                {filtered.map(order => (
                  <div 
                    key={order.id} 
                    className={`order-mini-card ${selectedOrder?.id === order.id ? 'active' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="mini-card-top">
                      <span className="mini-card-name">{order.cliente_nome || 'Cliente'} #{order.id.toString().slice(-3)}</span>
                      {order.tipo_entrega === 'delivery' ? <Bike size={14} color="#888"/> : <ShoppingBag size={14} color="#888"/>}
                    </div>
                    <div className="mini-card-sub">
                      Entregar até às {new Date(new Date(order.created_at).getTime() + 45*60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="sidebar-stats" style={{ padding: '10px', borderTop: '1px solid #eee', fontSize: '10px', display: 'flex', justifyContent: 'space-around' }}>
           <div>Pedidos: <strong>{ordersList.length}</strong></div>
           <div>Ticket Médio: <strong>R$ 39,40</strong></div>
        </div>
      </aside>

      {/* Painel de Detalhes do Pedido */}
      <main className="order-detail-panel">
        {selectedOrder ? (
          <>
            <div className="detail-header">
              <div className="customer-detail-title">
                <h2>{selectedOrder.cliente_nome} #{selectedOrder.id.toString().slice(-3)}</h2>
                <span className="status-pill-orange">{selectedOrder.status}</span>
                <button className="action-icon-btn" style={{ marginLeft: 'auto' }}><Settings size={16}/></button>
              </div>
              <div className="detail-pills-row">
                 <div className="detail-pill"><Phone size={14}/> {selectedOrder.cliente_telefone || 'Sem telefone'}</div>
                 <div className="detail-pill"><Clock size={14}/> Realizado às {new Date(selectedOrder.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                 {selectedOrder.origem_venda === 'manual' && <div className="detail-pill">Pedido Manual</div>}
              </div>
              <div style={{ marginTop: '12px', fontSize: '0.85rem', color: '#4285f4' }}>
                <MapIcon size={14}/> {selectedOrder.rua}, {selectedOrder.numero} - {selectedOrder.bairro} (Como chegar?)
              </div>
            </div>

            <div className="detail-items-list">
               <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#aaa', marginBottom: '1rem' }}>ITENS DO PEDIDO</div>
               {selectedOrder.itens?.map((item, idx) => (
                 <div key={idx} className="item-row-enterprise">
                    <div className="item-name-qty">
                      <strong>{item.quantidade}x</strong>
                      <span>{item.titulo}</span>
                    </div>
                    <strong>R$ {(item.preco_unitario * item.quantidade).toFixed(2)}</strong>
                 </div>
               ))}
            </div>

            <div className="detail-footer-totals">
               <div className="total-summary-card">
                  <div className="summary-row">
                    <span style={{ color: '#27ae60' }}>● Subtotal:</span>
                    <span>R$ {Number(selectedOrder.total || 0).toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span style={{ color: '#27ae60' }}>● Taxa de Entrega:</span>
                    <span>R$ 10,00</span>
                  </div>
                  <div className="summary-row grand-total">
                    <span style={{ color: '#27ae60' }}>● Total:</span>
                    <span>R$ {(Number(selectedOrder.total || 0) + 10).toFixed(2)}</span>
                  </div>
               </div>
               
               <div className="payment-method-row" style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>Pagamento:</span>
                  <div className="detail-pill" style={{ background: '#fff', border: '1px solid #eee' }}>
                    <CreditCard size={14}/> {selectedOrder.metodo_pagamento || 'Crédito'}: <strong>R$ {(Number(selectedOrder.total || 0) + 10).toFixed(2)}</strong>
                  </div>
                  <span className="status-pill" style={{ background: '#ef4444', color: '#fff' }}>Pendente</span>
               </div>
            </div>

            <div className="pdv-footer-action-bar">
               <div className="avatar-group" style={{ display: 'flex', gap: '5px' }}>
                  <div className="avatar-circle" style={{ background: '#3498db', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>BE</div>
                  <div className="avatar-circle" style={{ background: '#2ecc71', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>MA</div>
               </div>
               <button className="btn-enterprise-action" onClick={() => updateStatus(selectedOrder.id, selectedOrder.status === 'novos' ? 'preparo' : selectedOrder.status === 'preparo' ? 'entrega' : 'finalizado')}>
                  {selectedOrder.status === 'novos' ? 'MARCAR COMO PRONTO' : selectedOrder.status === 'preparo' ? 'SAIR PARA ENTREGA' : 'CONCLUIR PEDIDO'}
               </button>
            </div>
          </>
        ) : (
          <div className="empty-selection" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.3 }}>
             <ClipboardList size={64} />
             <p>Selecione um pedido para iniciar</p>
          </div>
        )}
      </main>
    </div>
  );

  const renderMesasView = () => (
    <div className="mesas-grid-container">
      <div className="mesas-toolbar">
         <button className="mesa-btn-filter active">Mesas</button>
         <button className="mesa-btn-filter">Pendentes</button>
         <button className="mesa-btn-filter">Finalizados</button>
         <div className="search-input-wrapper" style={{ marginLeft: 'auto', width: '300px' }}>
           <Search size={16} color="#aaa" />
           <input type="text" placeholder="Buscar Mesa..." />
         </div>
      </div>

      <div className="mesas-grid">
         {[1,2,3,4,5,6,7,8,9,10,11,12].map(num => {
           const isOccupied = num % 4 === 1;
           return (
             <div key={num} className={`mesa-card ${isOccupied ? 'occupied' : 'free'}`}>
                <div className="mesa-card-header">
                   <span className="mesa-id">{num.toString().padStart(3, '0')} {isOccupied ? 'Ocupada' : 'Mesa ' + num}</span>
                   <Settings size={14}/>
                </div>
                <div className="mesa-card-body">
                   {isOccupied ? (
                     <>
                       <div className="mesa-price">R$ {(Math.random() * 200).toFixed(2)}</div>
                       <div className="mesa-timer"><Clock size={12}/> {Math.floor(Math.random() * 60)} min</div>
                     </>
                   ) : (
                     <div className="mesa-id">Abrir Mesa</div>
                   )}
                </div>
             </div>
           );
         })}
      </div>
    </div>
  );

  const renderRastreamentoView = () => (
    <div className="pdv-main-layout">
       <aside className="kanban-vertical-sidebar" style={{ width: '280px' }}>
          <div className="category-group-header">EM PRODUÇÃO</div>
          <div className="sidebar-orders-list">
             {ordersList.filter(o => o.status === 'preparo').map(o => (
               <div key={o.id} className="order-mini-card">#{o.id.toString().slice(-3)} {o.cliente_nome}</div>
             ))}
          </div>
       </aside>
       <main style={{ flex: 1, position: 'relative', background: '#e5e5e5' }}>
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
             <strong>Mapa de Rastreamento Vivo</strong>
             <p style={{ fontSize: '11px', margin: 0, opacity: 0.7 }}>Acompanhe seus entregadores em tempo real</p>
          </div>
          <img 
            src="https://img.freepik.com/vector-premium/mapa-ciudad-generico-localizadores_23-2148281395.jpg" 
            alt="Map Grid" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
       </main>
    </div>
  );

  return (
    <div className="pdv-hub-container">
      {/* PDV TOP HEADER */}
      <header className="pdv-top-header">
        <div className="header-brand">
           <img src="/Logo Vini's estilo M.png" alt="Logo" />
           <div className="brand-info">
             <h1>Hot Dog do Vini</h1>
             <a href="#" target="_blank" rel="noreferrer">Acessar site de pedidos <ExternalLink size={10}/></a>
           </div>
        </div>

        <nav className="pdv-nav-tabs">
           <button className={`nav-tab-item ${activeTab === 'pedidos' ? 'active' : ''}`} onClick={() => setActiveTab('pedidos')}>
              <ClipboardList size={20}/>
              <span>Pedidos</span>
           </button>
           <button className={`nav-tab-item`} onClick={() => navigate('/admin/pdv')}>
              <Plus size={20}/>
              <span>Novo Pedido</span>
           </button>
           <button className={`nav-tab-item ${activeTab === 'mesas' ? 'active' : ''}`} onClick={() => setActiveTab('mesas')}>
              <Store size={20}/>
              <span>Presencial</span>
           </button>
           <button className={`nav-tab-item ${activeTab === 'mapa' ? 'active' : ''}`} onClick={() => setActiveTab('mapa')}>
              <MapIcon size={20}/>
              <span>Rastreamento</span>
           </button>
           <button className={`nav-tab-item`} onClick={() => navigate('/admin/caixa')}>
              <ShoppingBag size={20}/>
              <span>Caixa</span>
           </button>
        </nav>

        <div className="header-status-actions">
           <div 
             className="status-badge-container" 
             style={{ background: sessaoAtiva ? '#27ae60' : '#e74c3c', cursor: 'pointer' }}
             onClick={() => setIsAbrirModalOpen(!sessaoAtiva)}
           >
             <CheckCircle2 size={16}/>
             {sessaoAtiva ? 'Loja aberta' : 'Loja fechada'}
           </div>
           
           <div className="status-connectivity-pill" style={{ display: 'flex', gap: '5px', padding: '4px 10px', background: '#f8f9fa', borderRadius: '12px', fontSize: '10px', fontWeight: 700, color: '#27ae60', border: '1px solid #eee' }}>
              <div className="dot-pulse" style={{ width: '6px', height: '6px', background: '#27ae60', borderRadius: '50%' }}></div>
              SISTEMA ONLINE
           </div>

           <button className="action-icon-btn"><Printer size={18}/></button>
           <button className="action-icon-btn"><Settings size={18}/></button>
        </div>
      </header>

      {/* RENDER VIEW BASED ON TAB */}
      {!sessaoAtiva && activeTab === 'pedidos' && (
        <div className="vini-glass-panel animate-pulse" style={{ margin: '1rem', padding: '1.2rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '12px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
               <AlertCircle color="#ef4444" size={24} />
               <div>
                 <strong>Operação Bloqueada: Caixa Fechado</strong>
                 <p style={{ fontSize: '0.8rem', margin: 0 }}>Abra o caixa para gerenciar pedidos e realizar vendas.</p>
               </div>
             </div>
             <button className="vini-btn-primary" onClick={() => setIsAbrirModalOpen(true)}>Abrir Caixa Agora</button>
        </div>
      )}

      {activeTab === 'pedidos' && renderPedidosView()}
      {activeTab === 'mesas' && renderMesasView()}
      {activeTab === 'mapa' && renderRastreamentoView()}

      <AbrirCaixaModal 
        isOpen={isAbrirModalOpen}
        onClose={() => setIsAbrirModalOpen(false)}
        onOpenSuccess={(data) => {
          abrirSessao(data);
          setIsAbrirModalOpen(false);
          fetchOrders();
        }}
      />
    </div>
  );
}

export default Pedidos;
