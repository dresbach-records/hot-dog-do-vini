import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  Clock, ArrowRight, ArrowLeft, MoreHorizontal, 
  AlertCircle, CheckCircle2, Truck, ChefHat, 
  MapPin, CreditCard, X, Volume2, Printer, 
  Phone, User, MessageSquare, Bike
} from 'lucide-react';
import '../styles/admin/pedidos.css';

function Pedidos() {
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [motoboys, setMotoboys] = useState([]);
  
  const lastOrderCount = useRef(0);

  // Status flow profissional
  const statusFlow = ['novos', 'preparo', 'entrega', 'finalizado'];

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
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMotoboys = async () => {
    try {
      const resp = await api.get('/motoboys');
      if (resp.success) setMotoboys(resp.data || []);
    } catch (err) {}
  };

  useEffect(() => {
    fetchOrders();
    fetchMotoboys();
    const interval = setInterval(fetchOrders, 20000); // Polling 20s
    return () => clearInterval(interval);
  }, []);

  const handleNewOrderAlert = (order) => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => {});
    
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(`Novo pedido de ${order.cliente_nome || 'Cliente'}`);
      msg.lang = 'pt-BR';
      window.speechSynthesis.speak(msg);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.success) fetchOrders();
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  const assignMotoboy = async (orderId, motoboyId) => {
    try {
      const res = await api.put(`/orders/${orderId}/motoboy`, { motoboy_id: motoboyId });
      if (res.success) {
        alert('Motoboy atribuído!');
        fetchOrders();
        setSelectedOrder(null);
      }
    } catch (err) {
      alert('Erro ao atribuir motoboy');
    }
  };

  const renderOrderCard = (order) => {
    const timeAgo = Math.floor((new Date() - new Date(order.created_at)) / 60000);
    const isUrgent = timeAgo > 15 && order.status !== 'finalizado';

    return (
      <div 
        key={order.id} 
        className={`kanban-card status-${order.status} ${isUrgent ? 'urgent-border' : ''}`}
        onClick={() => setSelectedOrder(order)}
      >
        <div className="card-header">
          <span className="order-id">#{order.id.toString().slice(-4)}</span>
          <span className={`order-time ${isUrgent ? 'text-red' : ''}`}>
             <Clock size={12} /> {timeAgo}m
          </span>
        </div>

        <div className="customer-name">{order.cliente_nome || 'Cliente Balcão'}</div>
        
        <div className="order-context-info">
          <div className="info-item"><MapPin size={12} /> {order.bairro || 'Balcão'}</div>
          <div className="info-item"><CreditCard size={12} /> {order.forma_pagamento || 'Dinheiro'}</div>
        </div>

        <div className="order-summary-items">
          {order.itens?.length || 0} itens • R$ {Number(order.total || 0).toFixed(2)}
        </div>

        <div className="card-footer">
          <div className="card-actions" onClick={e => e.stopPropagation()}>
             {order.status !== 'novos' && (
               <button onClick={() => updateStatus(order.id, statusFlow[statusFlow.indexOf(order.status) - 1])}><ArrowLeft size={14}/></button>
             )}
             {order.status !== 'finalizado' && (
               <button className="btn-next" onClick={() => updateStatus(order.id, statusFlow[statusFlow.indexOf(order.status) + 1])}>
                 Próximo <ArrowRight size={14}/>
               </button>
             )}
          </div>
        </div>
      </div>
    );
  };

  const getOrders = (status) => ordersList.filter(o => o.status === status);

  return (
    <div className="pedidos-kanban-page">
      <header className="page-header">
        <div>
          <h2>Monitor de Pedidos 🔥</h2>
          <p>Operação em tempo real • {ordersList.length} pedidos ativos</p>
        </div>
        <div className="header-actions">
           <button className="vini-btn-outline"><Volume2 size={18}/> Som Ativo</button>
        </div>
      </header>

      <div className="kanban-container">
        {['novos', 'preparo', 'entrega', 'finalizado'].map(status => (
           <div key={status} className={`kanban-col col-${status}`}>
              <div className="col-header">
                 <h3>
                   {status === 'novos' && <AlertCircle size={18}/>}
                   {status === 'preparo' && <ChefHat size={18}/>}
                   {status === 'entrega' && <Truck size={18}/>}
                   {status === 'finalizado' && <CheckCircle2 size={18}/>}
                   {status.toUpperCase()}
                 </h3>
                 <span className="count-badge">{getOrders(status).length}</span>
              </div>
              <div className="col-body">
                 {getOrders(status).map(renderOrderCard)}
                 {getOrders(status).length === 0 && <div className="empty-state">Vazio</div>}
              </div>
           </div>
        ))}
      </div>

      {/* DETALHE DO PEDIDO (MODAL INDUSTRIAL) */}
      {selectedOrder && (
        <div className="vini-modal-overlay" onClick={() => setSelectedOrder(null)}>
           <div className="vini-glass-panel order-detail-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                 <h3>Pedido #{selectedOrder.id.toString().slice(-6)}</h3>
                 <button onClick={() => setSelectedOrder(null)}><X/></button>
              </div>

              <div className="modal-scroll-body">
                 <div className="detail-section">
                    <div className="section-title"><User size={16}/> Informações do Cliente</div>
                    <div className="user-card">
                       <div className="user-main">
                          <strong>{selectedOrder.cliente_nome}</strong>
                          <span><Phone size={14}/> {selectedOrder.cliente_telefone || 'Sem telefone'}</span>
                       </div>
                       <div className="user-actions">
                          <button className="btn-circle"><MessageSquare size={16}/></button>
                          <button className="btn-circle text-green"><Phone size={16}/></button>
                       </div>
                    </div>
                    <div className="address-box">
                       <MapPin size={16}/> {selectedOrder.rua}, {selectedOrder.numero} - {selectedOrder.bairro}
                       {selectedOrder.complemento && <div className="complement">{selectedOrder.complemento}</div>}
                    </div>
                 </div>

                 <div className="detail-section">
                    <div className="section-title">📦 Itens do Pedido</div>
                    <div className="items-list">
                       {selectedOrder.itens?.map((item, idx) => (
                          <div key={idx} className="item-row">
                             <div className="item-main">
                                <span className="item-qty">{item.quantidade}x</span>
                                <span className="item-name">{item.titulo}</span>
                             </div>
                             <span className="item-price">R$ {(Number(item.preco_unitario) * item.quantidade).toFixed(2)}</span>
                             {item.variacao_nome && <div className="item-sub">• {item.variacao_nome}</div>}
                             {item.adicionais?.map((a, i) => (
                               <div key={i} className="item-sub">+ {a.nome}</div>
                             ))}
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="detail-section">
                    <div className="section-title"><Bike size={16}/> Entrega (Motoboy)</div>
                    <select 
                      className="vini-select-dark"
                      value={selectedOrder.motoboy_id || ''}
                      onChange={(e) => assignMotoboy(selectedOrder.id, e.target.value)}
                    >
                       <option value="">Atribuir Motoboy...</option>
                       {motoboys.map(m => (
                         <option key={m.id} value={m.id}>{m.nome} ({m.veiculo})</option>
                       ))}
                    </select>
                 </div>
              </div>

              <div className="modal-footer">
                 <div className="total-row">
                    <span>Total a pagar</span>
                    <strong className="total-val">R$ {Number(selectedOrder.total || 0).toFixed(2)}</strong>
                 </div>
                 <div className="footer-btns">
                    <button className="btn-outline"><Printer size={18}/> Imprimir</button>
                    <button className="btn-primary" onClick={() => updateStatus(selectedOrder.id, statusFlow[statusFlow.indexOf(selectedOrder.status) + 1])}>
                       Avançar Pedido
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default Pedidos;
