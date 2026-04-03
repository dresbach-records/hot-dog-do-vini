import React, { useState } from 'react';
import { Clock, ArrowRight, ArrowLeft, MoreHorizontal, AlertCircle, CheckCircle2, Truck, ChefHat } from 'lucide-react';
import '../assets/styles/Dashboard.css';
import '../assets/styles/Pedidos.css';

const MOCK_ORDERS = [
  { id: '1024', customer: 'João Silva', items: '1x X-Tudo Artesanal, 2x Coca-cola 350ml, 1x Porção de Fritas', total: 64.90, time: '2m', status: 'novos' },
  { id: '1025', customer: 'Maria Fernanda', items: '2x Combo Smash Burger, 1x Suco Laranja', total: 89.00, time: '5m', status: 'novos' },
  { id: '1020', customer: 'Carlos Eduardo', items: '1x Pizza Calabresa Grande, Borda Recheada', total: 72.50, time: '15m', status: 'preparo', urgent: true },
  { id: '1022', customer: 'Ana Paula', items: '3x Cachorro Quente Especial, 1x Guaraná 2L', total: 45.00, time: '12m', status: 'preparo' },
  { id: '1018', customer: 'Roberto Nogueira', items: '1x X-Bacon, 1x X-Salada', total: 55.90, time: '28m', status: 'entrega' },
  { id: '1015', customer: 'Lucia Santos', items: '4x X-Burguer, 4x Fritas P', total: 110.00, time: '45m', status: 'finalizado' },
];

function Pedidos() {
  const [orders, setOrders] = useState(MOCK_ORDERS);

  // Status flow
  const statusFlow = ['novos', 'preparo', 'entrega', 'finalizado'];

  const moveOrder = (orderId, direction) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const currentIndex = statusFlow.indexOf(order.status);
        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (newIndex >= 0 && newIndex < statusFlow.length) {
          return { ...order, status: statusFlow[newIndex] };
        }
      }
      return order;
    }));
  };

  const getOrdersByStatus = (status) => orders.filter(o => o.status === status);

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'novos': return <AlertCircle size={18} />;
      case 'preparo': return <ChefHat size={18} />;
      case 'entrega': return <Truck size={18} />;
      case 'finalizado': return <CheckCircle2 size={18} />;
      default: return null;
    }
  };

  const renderColumn = (title, status, className) => {
    const columnOrders = getOrdersByStatus(status);
    
    return (
      <div className={`kanban-column ${className}`}>
        <div className="kanban-column-header">
          <div className="kanban-column-title">
            <StatusIcon status={status} />
            {title}
          </div>
          <span className="kanban-badge">{columnOrders.length}</span>
        </div>
        
        <div className="kanban-cards-container">
          {columnOrders.map(order => (
            <div key={order.id} className={`kanban-card status-${status}`}>
              <div className="card-header">
                <span className="order-id">#{order.id}</span>
                <span className={`order-time ${order.urgent ? 'urgent' : ''}`}>
                  <Clock size={12} /> {order.time}
                </span>
              </div>
              
              <div className="customer-name">{order.customer}</div>
              <div className="order-items">{order.items}</div>
              
              <div className="card-footer">
                <span className="order-total">
                  R$ {order.total.toFixed(2).replace('.', ',')}
                </span>
                
                <div className="card-actions">
                  {status !== 'novos' && (
                    <button className="action-btn" onClick={() => moveOrder(order.id, 'prev')} title="Voltar etapa">
                      <ArrowLeft size={16} />
                    </button>
                  )}
                  {status !== 'finalizado' && (
                    <button className="action-btn" onClick={() => moveOrder(order.id, 'next')} title="Avançar etapa">
                      <ArrowRight size={16} />
                    </button>
                  )}
                  <button className="action-btn" title="Mais opções">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {columnOrders.length === 0 && (
            <div style={{ textAlign: 'center', opacity: 0.5, padding: '2rem 0', fontSize: '0.9rem' }}>
              Nenhum pedido aqui
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header className="dashboard-header" style={{ flexShrink: 0 }}>
        <div>
          <h2>Kanban de Pedidos</h2>
          <p>Gerencie o fluxo de preparação e entrega em tempo real.</p>
        </div>
        <button className="btn btn-primary">
          + Novo Pedido Manual
        </button>
      </header>

      <div className="kanban-board">
        {renderColumn('Novos', 'novos', 'column-novos')}
        {renderColumn('Em Preparo', 'preparo', 'column-preparo')}
        {renderColumn('Saiu p/ Entrega', 'entrega', 'column-entrega')}
        {renderColumn('Finalizados', 'finalizado', 'column-finalizado')}
      </div>
    </div>
  );
}

export default Pedidos;
