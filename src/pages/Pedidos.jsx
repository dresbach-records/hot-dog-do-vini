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

  // Funções de Renderização Premium
  const renderOrdersColumn = (title, statusList, icon) => {
    const filtered = ordersList.filter(o => statusList.includes(o?.status));
    return (
      <div className="kanban-column-premium">
        <div className="column-header-premium">
           <div className="header-info-premium">
              {icon}
              <span>{title}</span>
           </div>
           <span className="count-pill-premium">{filtered.length}</span>
        </div>
        <div className="column-content-premium">
           {filtered.map(order => (
             <div 
               key={order?.id} 
               className={`order-card-premium ${selectedOrder?.id === order?.id ? 'active' : ''}`}
               onClick={() => setSelectedOrder(order)}
             >
                <div className="card-top-premium">
                   <span className="order-number-premium">#{order?.id?.toString().slice(-3)}</span>
                   <span className="order-time-premium">
                      <Clock size={12}/> {order?.created_at ? new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
                   </span>
                </div>
                <div className="card-body-premium">
                   <div className="customer-name-premium">{order?.cliente_nome || 'Cliente'}</div>
                   <div className="order-summary-premium">
                      {order?.tipo_entrega === 'delivery' ? <Bike size={14} color="#ea1d2c"/> : <ShoppingBag size={14} color="#27ae60"/>}
                      <span>{order?.itens?.length || 0} itens • R$ {Number(order?.total || 0).toFixed(2)}</span>
                   </div>
                </div>
                {order?.origem_venda === 'ifood' && (
                  <div className="ifood-badge-premium">IFOOD</div>
                )}
             </div>
           ))}
        </div>
      </div>
    );
  };

  const renderPedidosView = () => (
    <div className="pdv-main-layout-premium">
      {/* 3 Colunas Kanban */}
      <div className="kanban-container-premium">
         {renderOrdersColumn('NOVOS', ['novos'], <AlertCircle size={18} color="#f39c12"/>)}
         {renderOrdersColumn('PREPARO', ['preparo'], <ChefHat size={18} color="#3498db"/>)}
         {renderOrdersColumn('ENTREGA / FINALIZADOS', ['entrega', 'finalizado'], <Truck size={18} color="#27ae60"/>)}
      </div>

      {/* Detalhes do Pedido (Lado Direito) */}
      <aside className="order-details-aside-premium">
         {selectedOrder ? (
           <div className="details-content-premium">
              <div className="details-header-premium">
                 <div className="title-row-premium">
                    <h2>Detalhes do Pedido #{selectedOrder?.id?.toString().slice(-3)}</h2>
                    <button className="close-details-btn" onClick={() => setSelectedOrder(null)}><X size={20}/></button>
                 </div>
                 <div className="status-indicator-premium">
                    Status Atual: <span className={`status-tag-premium ${selectedOrder?.status}`}>{selectedOrder?.status?.toUpperCase()}</span>
                 </div>
              </div>

              <div className="details-scroll-premium">
                 <div className="section-premium">
                    <h3><User size={16}/> CLIENTE</h3>
                    <p><strong>{selectedOrder?.cliente_nome}</strong></p>
                    <p><Phone size={14}/> {selectedOrder?.cliente_telefone || 'Sem telefone'}</p>
                    {selectedOrder?.tipo_entrega === 'delivery' && (
                       <p className="address-p-premium">
                          <MapIcon size={14}/> {selectedOrder?.rua}, {selectedOrder?.numero} - {selectedOrder?.bairro}
                       </p>
                    )}
                 </div>

                 <div className="section-premium">
                    <h3><ClipboardList size={16}/> PRODUTOS</h3>
                    <div className="items-list-premium">
                       {selectedOrder?.itens?.map((item, idx) => (
                         <div key={idx} className="item-row-premium">
                            <div className="item-qty-name-premium">
                               <span className="qty-badge-premium">{item?.quantidade}x</span>
                               <span className="name-text-premium">{item?.titulo}</span>
                            </div>
                            <span className="price-text-premium">R$ {(Number(item?.preco_unitario || 0) * Number(item?.quantidade || 0)).toFixed(2)}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="section-premium totals-section-premium">
                    <div className="total-row-premium">
                       <span>Subtotal</span>
                       <span>R$ {Number(selectedOrder?.total || 0).toFixed(2)}</span>
                    </div>
                    {selectedOrder?.taxa_entrega && (
                      <div className="total-row-premium">
                        <span>Taxa de Entrega</span>
                        <span>R$ {Number(selectedOrder.taxa_entrega).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="total-row-premium grand-total-premium">
                       <span>TOTAL</span>
                       <span>R$ {Number(selectedOrder?.total || 0).toFixed(2)}</span>
                    </div>
                    <div className="payment-method-premium">
                       <CreditCard size={16}/> {selectedOrder?.metodo_pagamento || 'A combinar'}
                    </div>
                 </div>
              </div>

              <div className="details-actions-premium">
                 <button className="btn-print-premium"><Printer size={18}/> Imprimir</button>
                 <button 
                   className="btn-next-step-premium"
                   onClick={() => updateStatus(selectedOrder?.id, selectedOrder?.status === 'novos' ? 'preparo' : selectedOrder?.status === 'preparo' ? 'entrega' : 'finalizado')}
                 >
                    {selectedOrder?.status === 'novos' ? 'COMEÇAR PREPARO' : 
                     selectedOrder?.status === 'preparo' ? 'SAIR PARA ENTREGA' : 'CONCLUIR PEDIDO'}
                 </button>
              </div>
           </div>
         ) : (
           <div className="empty-details-premium">
              <ShoppingBag size={64} opacity={0.2}/>
              <p>Selecione um pedido para visualizar os detalhes e gerenciar a produção.</p>
           </div>
         )}
      </aside>
    </div>
  );

  return (
    <div className="pdv-hub-container-premium">
      <header className="pdv-top-header-premium">
        <div className="header-brand-premium">
           <img src="/Logo Vini's estilo M.png" alt="Logo" />
           <div className="brand-info-premium">
             <h1>Hot Dog do Vini</h1>
             <div className="connectivity-status-premium">
                <div className="dot-pulse-premium"></div>
                SISTEMA OPERACIONAL
             </div>
           </div>
        </div>

        <nav className="pdv-nav-tabs-premium">
           <button className={`nav-tab-premium ${activeTab === 'pedidos' ? 'active' : ''}`} onClick={() => setActiveTab('pedidos')}>
              <ClipboardList size={20}/>
              <span>GESTÃO DE PEDIDOS</span>
           </button>
           <button className="nav-tab-premium" onClick={() => navigate('/admin/pdv')}>
              <Plus size={20}/>
              <span>NOVO PEDIDO</span>
           </button>
        </nav>

        <div className="header-actions-premium">
           <div 
             className={`store-status-pill-premium ${sessaoAtiva ? 'open' : 'closed'}`}
             onClick={() => setIsAbrirModalOpen(true)}
           >
              {sessaoAtiva ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
              {sessaoAtiva ? 'LOJA ABERTA' : 'LOJA FECHADA'}
           </div>
           <button className="header-action-btn-premium"><Settings size={20}/></button>
        </div>
      </header>

      {renderPedidosView()}

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
