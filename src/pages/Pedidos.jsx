import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { 
  Clock, ArrowRight, AlertCircle, CheckCircle2, Truck, ChefHat, 
  MapPin, CreditCard, X, Volume2, Printer, 
  Phone, User, MessageSquare, Plus, QrCode
} from 'lucide-react';
import '../styles/admin/pedidos.css';
import { useNavigate } from 'react-router-dom';

function Pedidos() {
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();
  
  const lastOrderCount = useRef(0);
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

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
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

  // Drag & Drop
  const onDragStart = (e, orderId) => {
    e.dataTransfer.setData("orderId", orderId);
    e.currentTarget.style.opacity = '0.4';
  };
  const onDragEnd = (e) => e.currentTarget.style.opacity = '1';
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (e, newStatus) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData("orderId");
    updateStatus(orderId, newStatus);
  };

  const renderOrderCard = (order) => {
    const timeAgo = Math.floor((new Date() - new Date(order.created_at)) / 60000);
    const isUrgent = timeAgo > 15 && order.status !== 'finalizado';

    return (
      <div 
        key={order.id} 
        draggable
        onDragStart={(e) => onDragStart(e, order.id)}
        onDragEnd={onDragEnd}
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
          <div className="info-item"><MapPin size={12} /> {order.bairro || 'Retirada'}</div>
          {order.pagamento_comprovante && <div className="info-item text-orange"><QrCode size={12}/> Pix Anexo</div>}
        </div>
        <div className="card-footer">
           <button className="btn-next" onClick={(e) => {
             e.stopPropagation();
             updateStatus(order.id, statusFlow[statusFlow.indexOf(order.status) + 1]);
           }}>
             Avançar <ArrowRight size={14}/>
           </button>
        </div>
      </div>
    );
  };

  const getOrders = (status) => ordersList.filter(o => o.status === status);

  if (loading) return <div className="loading-vini">Carregando Monitor...</div>;

  return (
    <div className="pedidos-kanban-page">
      <header className="page-header">
        <div>
          <h2>Monitor de Pedidos 🔥</h2>
          <p>Operação em tempo real • {ordersList.length} pedidos ativos</p>
        </div>
        <div className="header-actions">
           <button className="vini-btn-primary" onClick={() => navigate('/admin/pdv')}>
              <Plus size={18}/> Novo Pedido
           </button>
           <button className="vini-btn-outline"><Volume2 size={18}/> Som Ativo</button>
        </div>
      </header>

      <div className="kanban-container">
        {statusFlow.map(status => (
           <div 
             key={status} 
             className={`kanban-col col-${status}`}
             onDragOver={onDragOver}
             onDrop={(e) => onDrop(e, status)}
           >
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
                 {getOrders(status).length === 0 && <div className="empty-state">Sem pedidos</div>}
              </div>
           </div>
        ))}
      </div>

      {selectedOrder && (
        <div className="vini-modal-overlay" onClick={() => setSelectedOrder(null)}>
           <div className="vini-glass-panel order-detail-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                 <h3>Pedido #{selectedOrder.id.toString().slice(-4)}</h3>
                 <button className="close-btn" onClick={() => setSelectedOrder(null)}><X/></button>
              </div>

              <div className="modal-scroll-body">
                 <div className="detail-section">
                    <div className="section-title"><User size={16}/> Cliente</div>
                    <div className="user-card">
                       <div className="user-main">
                          <strong>{selectedOrder.cliente_nome}</strong>
                          <div className="user-meta">{selectedOrder.cliente_email}</div>
                          <div className="user-meta"><Phone size={14}/> {selectedOrder.cliente_telefone || 'Sem telefone'}</div>
                       </div>
                       <div className="user-actions">
                          <button className="btn-circle"><MessageSquare size={16}/></button>
                       </div>
                    </div>

                    {selectedOrder.pagamento_comprovante && (
                      <div className="pix-validation-box">
                         <div className="pix-val-header"><QrCode size={18} /> Comprovante PIX</div>
                         <a href={selectedOrder.pagamento_comprovante} target="_blank" rel="noreferrer">
                            <img src={selectedOrder.pagamento_comprovante} alt="Comprovante" className="receipt-img" />
                         </a>
                         <p className="pix-val-tip">Clique para ampliar e validar o valor</p>
                      </div>
                    )}

                    <div className="address-box">
                       <MapPin size={16}/> {selectedOrder.tipo_entrega === 'retirada' ? 'RETIRADA NA LOJA' : `${selectedOrder.rua}, ${selectedOrder.numero} - ${selectedOrder.bairro}`}
                    </div>
                 </div>

                 <div className="detail-section">
                    <div className="section-title">📦 Itens</div>
                    <div className="items-list">
                       {selectedOrder.itens?.map((item, idx) => (
                          <div key={idx} className="item-row">
                             <div className="item-main">
                                <span className="item-qty">{item.quantidade}x</span>
                                <span className="item-name">{item.titulo}</span>
                                <span className="item-price">R$ {(item.preco_unitario * item.quantidade).toFixed(2)}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="modal-footer">
                 <div className="total-row">
                    <span>Total</span>
                    <strong>R$ {Number(selectedOrder.total || 0).toFixed(2)}</strong>
                 </div>
                 <div className="footer-btns">
                    <button className="vini-btn-outline"><Printer size={18}/> Imprimir</button>
                    <button className="vini-btn-primary" onClick={() => {
                        updateStatus(selectedOrder.id, statusFlow[statusFlow.indexOf(selectedOrder.status) + 1]);
                        setSelectedOrder(null);
                    }}>
                       {selectedOrder.status === 'finalizado' ? 'Concluir' : 'Avançar Etapa'}
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
