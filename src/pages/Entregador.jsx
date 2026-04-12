import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Bike, MapPin, CheckCircle, Navigation, 
  Phone, User, Package, ChevronRight, AlertCircle,
  ExternalLink, Search
} from 'lucide-react';
import '../styles/admin/pdv.css';

function Entregador() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDelivery, setActiveDelivery] = useState(null);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const resp = await api.get('/orders');
      // Filtrar apenas pedidos em rota de entrega
      if (resp.success) {
        setDeliveries((resp.data || []).filter(o => o.status === 'entrega'));
      }
    } catch (err) {
      console.error('Erro ao buscar entregas:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelivery = async (orderId) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: 'finalizado' });
      if (res.success) {
        alert('Entrega confirmada com sucesso!');
        setActiveDelivery(null);
        fetchDeliveries();
      }
    } catch (err) {
      alert('Erro ao confirmar entrega');
    }
  };

  const openGmaps = (order) => {
    const address = `${order.rua}, ${order.numero}, ${order.bairro}, ${order.cidade || 'Florianópolis'}`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
  };

  if (loading) return <div>Acessando Painel do Entregador...</div>;

  return (
    <div className="pdv-hub-container" style={{ background: '#f5f5f5' }}>
      <header style={{ height: '60px', background: '#ea1d2c', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
        <Bike size={24} style={{ marginRight: '10px' }}/>
        <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Vini's Entregas</span>
      </header>

      <main style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        
        {!activeDelivery ? (
          <>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h2 style={{ fontSize: '1rem', margin: 0 }}>MINHAS ENTREGAS ({deliveries.length})</h2>
               <button onClick={fetchDeliveries} style={{ background: 'none', border: 'none', color: '#ea1d2c', fontSize: '0.8rem', fontWeight: 700 }}>ATUALIZAR</button>
            </div>

            {deliveries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: '12px', border: '1px solid #eee' }}>
                 <AlertCircle size={48} color="#ddd" style={{ marginBottom: '10px' }}/>
                 <p style={{ color: '#888' }}>Sem entregas pendentes no momento.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {deliveries.map(delivery => (
                  <div 
                    key={delivery.id} 
                    className="vini-glass-panel" 
                    style={{ background: '#fff', border: '1px solid #eee', padding: '1rem', borderRadius: '12px' }}
                    onClick={() => setActiveDelivery(delivery)}
                  >
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700 }}>#{delivery.id.toString().slice(-3)} - {delivery.cliente_nome}</span>
                        <span style={{ fontSize: '0.8rem', color: '#ea1d2c', fontWeight: 700 }}>R$ {(Number(delivery.total) + 10).toFixed(2)}</span>
                     </div>
                     <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px' }}>
                        <MapPin size={14} style={{ marginRight: '5px' }}/> {delivery.bairro}
                     </div>
                     <button className="vini-btn-primary" style={{ width: '100%', height: '40px', fontSize: '0.8rem' }}>
                        INICIAR ROTA
                     </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div>
            <button 
              onClick={() => setActiveDelivery(null)} 
              style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#666', marginBottom: '1.5rem', fontWeight: 700 }}
            >
               <ArrowLeft size={20}/> VOLTAR
            </button>

            <div className="vini-glass-panel" style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
               <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Cliente</div>
                  <h1 style={{ margin: '5px 0' }}>{activeDelivery.cliente_nome}</h1>
                  <div style={{ color: '#ea1d2c', fontWeight: 700 }}>Pedido #{activeDelivery.id.toString().slice(-3)}</div>
               </div>

               <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                     <MapPin size={20} color="#ea1d2c"/>
                     <div>
                        <strong>Endereço de Entrega</strong>
                        <div style={{ fontSize: '0.9rem' }}>{activeDelivery.rua}, {activeDelivery.numero}</div>
                        <div style={{ fontSize: '0.9rem', color: '#888' }}>{activeDelivery.bairro} - {activeDelivery.cidade || 'Florianópolis'}</div>
                     </div>
                  </div>
                  <button 
                    className="vini-btn-outline" 
                    style={{ width: '100%', border: '2px solid #ea1d2c', color: '#ea1d2c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    onClick={() => openGmaps(activeDelivery)}
                  >
                    <Navigation size={18}/> ABRIR NO GPS
                  </button>
               </div>

               <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                  <button className="vini-btn-primary" style={{ flex: 1, background: '#333' }} onClick={() => window.location.href = `tel:${activeDelivery.cliente_telefone}`}>
                     <Phone size={18}/> LIGAR
                  </button>
                  <button className="vini-btn-primary" style={{ flex: 1, background: '#25D366' }} onClick={() => window.open(`https://wa.me/${activeDelivery.cliente_telefone}`, '_blank')}>
                     <MessageCircle size={18}/> WHATSAPP
                  </button>
               </div>

               <div style={{ borderTop: '1px dashed #ddd', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                     <span>Valor à Receber:</span>
                     <strong style={{ fontSize: '1.2rem' }}>R$ {(Number(activeDelivery.total) + 10).toFixed(2)}</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '1.5rem' }}>Meio de Pagamento: {activeDelivery.metodo_pagamento || 'A combinar'}</div>
                  
                  <button 
                    className="vini-btn-primary" 
                    style={{ width: '100%', background: '#27ae60', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    onClick={() => confirmDelivery(activeDelivery.id)}
                  >
                    <CheckCircle size={24}/> CONFIRMAR ENTREGA
                  </button>
               </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// Mocks de ícones auxiliares não definidos acima
const ArrowLeft = ({ size, color }) => <ChevronRight size={size} color={color} style={{ transform: 'rotate(180deg)' }} />;

export default Entregador;
