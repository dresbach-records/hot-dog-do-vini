import React, { useEffect, useState } from 'react';
import { 
  Package, 
  MapPin, 
  Clock, 
  ChevronRight, 
  ArrowLeft 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const MeusPedidos = ({ session }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      if (!session?.user) return;
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('cliente_id', (await supabase.from('clientes').select('id').eq('codigo_vini', session.user.id).single()).data.id)
        .order('created_at', { ascending: false });

      if (!error) setPedidos(data);
      setLoading(false);
    };

    fetchPedidos();
  }, [session]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return '#EAB308';
      case 'preparando': return '#3B82F6';
      case 'entregue': return '#22C55E';
      case 'cancelado': return '#EF4444';
      default: return '#999';
    }
  };

  if (loading) return <div className="vini-portal-p-loading">Carregando seus pedidos...</div>;

  return (
    <div className="vini-portal-p-container">
      <header className="vini-portal-p-header">
        <button onClick={() => window.history.back()} className="vini-back-btn">
          <ArrowLeft size={24} />
        </button>
        <h1 className="vini-portal-p-title">Meus Pedidos</h1>
      </header>

      <main className="vini-portal-p-content">
        {pedidos.length === 0 ? (
          <div className="vini-empty-state">
            <Package size={64} color="#eee" />
            <p>Você ainda não realizou nenhum pedido</p>
            <button className="vini-btn-primary" onClick={() => window.location.href = '/cliente.vinis'}>
              Pedir agora
            </button>
          </div>
        ) : (
          <div className="vini-pedidos-list">
            {pedidos.map(pedido => (
              <div key={pedido.id} className="vini-pedido-card">
                <div className="vini-pedido-header">
                  <div className="vini-pedido-id">Pedido {pedido.codigo_pedido_curto || `#${pedido.id.slice(0, 4)}`}</div>
                  <div 
                    className="vini-badge-status" 
                    style={{ backgroundColor: getStatusColor(pedido.status) + '20', color: getStatusColor(pedido.status) }}
                  >
                    {pedido.status.toUpperCase()}
                  </div>
                </div>

                <div className="vini-pedido-body">
                  <div className="vini-pedido-items">
                    {pedido.itens.map((item, idx) => (
                      <span key={idx}>{item.quantity}x {item.title}{idx < pedido.itens.length - 1 ? ', ' : ''}</span>
                    ))}
                  </div>
                  <div className="vini-pedido-total">R$ {Number(pedido.total).toFixed(2).replace('.', ',')}</div>
                </div>

                <div className="vini-pedido-footer">
                   <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#999' }}>
                      <Clock size={14} />
                      {new Date(pedido.created_at).toLocaleDateString('pt-BR')} as {new Date(pedido.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                   </div>
                   <button className="vini-btn-details">Ver Detalhes <ChevronRight size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style jsx>{`
        .vini-portal-p-container { min-height: 100vh; background: #f8f8fb; }
        .vini-portal-p-header { background: #fff; padding: 20px; display: flex; align-items: center; gap: 20px; border-bottom: 1px solid #f0f0f0; }
        .vini-portal-p-title { margin: 0; font-size: 20px; font-weight: 800; }
        .vini-portal-p-content { max-width: 600px; margin: 0 auto; padding: 20px; }
        
        .vini-pedido-card { background: #fff; border-radius: 16px; padding: 20px; margin-bottom: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.03); border: 1px solid #f0f0f0; }
        .vini-pedido-header { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px dashed #eee; padding-bottom: 10px; }
        .vini-pedido-id { font-weight: 800; color: #333; }
        .vini-badge-status { font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 6px; }
        
        .vini-pedido-body { margin-bottom: 15px; }
        .vini-pedido-items { font-size: 14px; color: #666; display: block; margin-bottom: 5px; }
        .vini-pedido-total { font-weight: 800; font-size: 18px; color: var(--p-red, #EA1D2C); }
        
        .vini-pedido-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid #f9f9f9; }
        .vini-btn-details { background: none; border: none; color: #3B82F6; font-weight: 700; font-size: 13px; display: flex; align-items: center; gap: 2px; cursor: pointer; }
        
        .vini-empty-state { text-align: center; padding: 60px 20px; color: #999; }
        .vini-btn-primary { background: var(--p-red, #EA1D2C); color: #fff; border: none; padding: 12px 30px; border-radius: 12px; font-weight: 700; margin-top: 20px; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default MeusPedidos;
