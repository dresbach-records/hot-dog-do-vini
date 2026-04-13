import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  MapPin, Clock, Bike, Phone, 
  ChevronLeft, CheckCircle, Package 
} from 'lucide-react';

/**
 * Rastreamento Enterprise — Visualização de Pedido em Tempo Real
 * Implementado com iFrame de Alta Disponibilidade.
 */
function Rastreamento() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const resp = await api.get(`/orders/${orderId}`);
        if (resp?.success) {
          setOrder(resp.data);
        }
      } catch (e) {
        console.error('Erro ao rastrear pedido');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
    const interval = setInterval(fetchOrder, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) return <div className="vini-loading">Localizando seu hot dog...</div>;
  if (!order) return <div className="vini-error">Pedido não localizado.</div>;

  const address = `${order.rua}, ${order.numero}, ${order.bairro}, ${order.cidade || 'Taquara'}, RS`;
  // Embed do Google Maps (Funciona sem Key para Embed simples em muitos casos, ou usa OSM fallback)
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="vini-rastreamento-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f7f7f7' }}>
      
      {/* Header Fixo */}
      <header style={{ padding: '1.5rem', background: '#fff', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '15px' }}>
         <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft/></button>
         <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Acompanhando Pedido #{orderId?.slice(-3)}</h2>
            <span style={{ fontSize: '12px', color: '#27ae60', fontWeight: 700 }}>{order.status?.toUpperCase()}</span>
         </div>
      </header>

      {/* Mapa via Iframe (Industrial) */}
      <div style={{ flex: 1, position: 'relative' }}>
         <iframe 
           width="100%" 
           height="100%" 
           frameBorder="0" 
           src={mapUrl}
           title="Mapa de Entrega"
           style={{ border: 0 }}
           allowFullScreen
         ></iframe>

         {/* Overlay de Status flutuante */}
         <div style={{ 
           position: 'absolute', 
           bottom: '2rem', 
           left: '1rem', 
           right: '1rem', 
           background: '#fff', 
           padding: '1.5rem', 
           borderRadius: '16px', 
           boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
           display: 'flex',
           alignItems: 'center',
           gap: '20px'
         }}>
            <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '50%' }}>
               {order.status === 'entrega' ? <Bike size={32} color="#ea1d2c"/> : <Package size={32} color="#ea1d2c"/>}
            </div>
            <div style={{ flex: 1 }}>
               <strong style={{ display: 'block' }}>{order.status === 'novos' ? 'Pedido Recebido' : order.status === 'preparo' ? 'Sendo Preparado' : 'Em Rota de Entrega'}</strong>
               <span style={{ fontSize: '12px', opacity: 0.6 }}>Previsão: {order.tempo_estimado || '30-45 min'}</span>
            </div>
            <button style={{ background: '#27ae60', border: 'none', padding: '10px', borderRadius: '50%', color: '#fff' }}>
               <Phone size={20}/>
            </button>
         </div>
      </div>

    </div>
  );
}

export default Rastreamento;
