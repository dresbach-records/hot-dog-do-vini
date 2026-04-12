import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  ShoppingBag, Clock, CheckCircle2, AlertCircle, 
  Search, Plus, X, Printer, CreditCard, ClipboardList,
  Store, Bike, Map as MapIcon, Settings, ExternalLink,
  ChefHat, Truck, MessageCircle, Phone, User, QrCode
} from 'lucide-react';
import { useCaixa } from '../context/CaixaContext';
import AbrirCaixaModal from '../components/Caixa/AbrirCaixaModal';
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
      if (resp?.success) {
        const data = resp.data || [];
        if (data.length > lastOrderCount.current && lastOrderCount.current !== 0) {
          handleNewOrderAlert(data[0]);
        }
        setOrdersList(data);
        lastOrderCount.current = data.length;
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
      if (res?.success) {
        setOrdersList(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        if (selectedOrder?.id === orderId) {
           setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar status');
    }
  };

  const renderPedidosView = () => (
    <div className="pdv-main-layout">
      <aside className="kanban-vertical-sidebar">
        <div className="sidebar-search">
           <div className="search-input-wrapper">
             <Search size={16} color="#aaa" />
             <input type="text" placeholder="Busca" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
        </div>
        <div className="sidebar-orders-list">
          {['novos', 'preparo', 'entrega'].map(status => {
            const filtered = ordersList.filter(o => o?.status === status);
            if (filtered.length === 0 && status !== 'novos') return null;
            return (
              <div key={status} className="status-group">
                <div className="category-group-header">
                  <span>{status === 'novos' ? 'EM PRODUÇÃO' : status === 'preparo' ? 'PRONTOS' : 'EM ENTREGA'}</span>
                  <span>{filtered.length}</span>
                </div>
                {filtered.map(order => (
                  <div key={order?.id} className={`order-mini-card ${selectedOrder?.id === order?.id ? 'active' : ''}`} onClick={() => setSelectedOrder(order)}>
                    <div className="mini-card-top">
                      <span className="mini-card-name">{order?.cliente_nome || 'Cliente'} #{order?.id?.toString().slice(-3)}</span>
                      {order?.tipo_entrega === 'delivery' ? <Bike size={14} color="#888"/> : <ShoppingBag size={14} color="#888"/>}
                    </div>
                    <div className="mini-card-sub">
                      Entregar até {order?.created_at ? new Date(new Date(order.created_at).getTime() + 45*60000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </aside>
      <main className="order-detail-panel">
        {selectedOrder ? (
          <>
            <div className="detail-header">
              <div className="customer-detail-title">
                <h2>{selectedOrder?.cliente_nome} #{selectedOrder?.id?.toString().slice(-3)}</h2>
                <span className="status-pill-orange">{selectedOrder?.status?.toUpperCase()}</span>
                <button className="action-icon-btn" style={{ marginLeft: 'auto' }}><Settings size={16}/></button>
              </div>
              <div className="detail-pills-row">
                 <div className="detail-pill"><Phone size={14}/> {selectedOrder?.cliente_telefone || 'Sem telefone'}</div>
                 <div className="detail-pill"><Clock size={14}/> {selectedOrder?.created_at ? new Date(selectedOrder.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}</div>
              </div>
            </div>
            <div className="detail-items-list">
               {selectedOrder?.itens?.map((item, idx) => (
                 <div key={idx} className="item-row-enterprise">
                    <div className="item-name-qty"><strong>{item?.quantidade}x</strong> <span>{item?.titulo}</span></div>
                    <strong>R$ {(Number(item?.preco_unitario || 0) * Number(item?.quantidade || 0)).toFixed(2)}</strong>
                 </div>
               ))}
            </div>
            <div className="detail-footer-totals">
               <div className="total-summary-card">
                  <div className="summary-row"><span>Subtotal:</span> <span>R$ {Number(selectedOrder?.total || 0).toFixed(2)}</span></div>
                  <div className="summary-row grand-total"><span>Total:</span> <span>R$ {Number(selectedOrder?.total || 0).toFixed(2)}</span></div>
               </div>
            </div>
            <div className="pdv-footer-action-bar">
               <button className="btn-enterprise-action" onClick={() => updateStatus(selectedOrder?.id, selectedOrder?.status === 'novos' ? 'preparo' : selectedOrder?.status === 'preparo' ? 'entrega' : 'finalizado')}>
                  {(selectedOrder?.status === 'novos' ? 'COMEÇAR PREPARO' : selectedOrder?.status === 'preparo' ? 'SAIR PARA ENTREGA' : 'FINALIZAR')}
               </button>
            </div>
          </>
        ) : <div className="empty-selection">Selecione um pedido</div>}
      </main>
    </div>
  );

  return (
    <div className="pdv-hub-container">
      <header className="pdv-top-header">
        <div className="header-brand">
           <img src="/Logo Vini's estilo M.png" alt="Logo" />
           <div className="brand-info">
             <h1>Hot Dog do Vini</h1>
             <a href="#" target="_blank" rel="noreferrer">Ver Site <ExternalLink size={10}/></a>
           </div>
        </div>
        <nav className="pdv-nav-tabs">
           <button className={`nav-tab-item ${activeTab === 'pedidos' ? 'active' : ''}`} onClick={() => setActiveTab('pedidos')}><ClipboardList size={20}/> <span>Pedidos</span></button>
           <button className="nav-tab-item" onClick={() => navigate('/admin/pdv')}><Plus size={20}/> <span>Novo</span></button>
        </nav>
        <div className="header-status-actions">
           <div className="status-badge-container" style={{ background: sessaoAtiva ? '#27ae60' : '#e74c3c' }} onClick={() => setIsAbrirModalOpen(!sessaoAtiva)}>
             <CheckCircle2 size={16}/> {sessaoAtiva ? 'Loja aberta' : 'Loja fechada'}
           </div>
        </div>
      </header>
      {!sessaoAtiva && <div className="closed-banner">Caixa Fechado</div>}
      {activeTab === 'pedidos' && renderPedidosView()}
      <AbrirCaixaModal isOpen={isAbrirModalOpen} onClose={() => setIsAbrirModalOpen(false)} onOpenSuccess={(data) => { abrirSessao(data); setIsAbrirModalOpen(false); fetchOrders(); }} />
    </div>
  );
}
export default Pedidos;
