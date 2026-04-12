import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, CreditCard, 
  Search as PixIcon, Calendar, User, 
  ArrowUpRight, AlertCircle, RefreshCcw,
  ExternalLink, ChevronRight, MoreHorizontal
} from 'lucide-react';
import api from '../services/api';
import '../styles/admin/dashboard.css';

function Cobrancas() {
  const [activeTab, setActiveTab] = useState('credit_card');
  const [cobrancas, setCobrancas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCobrancas();
  }, [activeTab]);

  const fetchCobrancas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pagarme/orders', { 
        params: { payment_method: activeTab } 
      });
      if (res.success) setCobrancas(res.data.data || []);
    } catch (error) {
      console.error('Erro ao buscar cobranças Pagar.me:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    paid: { bg: '#dcfce7', text: '#166534', label: 'Pago' },
    pending: { bg: '#fef9c3', text: '#854d0e', label: 'Pendente' },
    failed: { bg: '#fee2e2', text: '#991b1b', label: 'Falhou' },
    canceled: { bg: '#f1f5f9', text: '#475569', label: 'Cancelado' }
  };

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem', background: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CreditCard color="#4f46e5" /> Pedidos
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Acompanhe todas as vendas realizadas via Pagar.me</p>
      </header>

      {/* TABS ESTILO PAGARME */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
         <button 
           onClick={() => setActiveTab('credit_card')}
           style={{ padding: '0.8rem 0', background: 'none', border: 'none', fontSize: '0.95rem', fontWeight: activeTab === 'credit_card' ? '700' : '500', color: activeTab === 'credit_card' ? '#4f46e5' : '#64748b', borderBottom: activeTab === 'credit_card' ? '2px solid #4f46e5' : '2px solid transparent', cursor: 'pointer' }}
         >
           Cartão de Crédito
         </button>
         <button 
           onClick={() => setActiveTab('pix')}
           style={{ padding: '0.8rem 0', background: 'none', border: 'none', fontSize: '0.95rem', fontWeight: activeTab === 'pix' ? '700' : '500', color: activeTab === 'pix' ? '#4f46e5' : '#64748b', borderBottom: activeTab === 'pix' ? '2px solid #4f46e5' : '2px solid transparent', cursor: 'pointer' }}
         >
           Pix
         </button>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="vini-glass-panel" style={{ padding: '1rem', background: '#fff', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
         <div style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '500px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
               <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
               <input 
                 placeholder="Filtrar por ID do pedido ou cliente..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
               />
            </div>
            <button style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
               <Filter size={16} /> Filtros
            </button>
         </div>
         <button className="vini-btn-primary" style={{ background: '#4f46e5', borderColor: '#4f46e5', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={16} /> Exportar
         </button>
      </div>

      <div className="vini-glass-panel" style={{ padding: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
             <RefreshCcw className="animate-spin" size={32} style={{ margin: '0 auto 10px' }} />
             Carregando cobranças...
          </div>
        ) : cobrancas.length > 0 ? (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <tr>
                   <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>ID do Pedido</th>
                   <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                   <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Valor</th>
                   <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Criado em</th>
                   <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Cliente</th>
                   <th style={{ padding: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {cobrancas.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#4f46e5', fontWeight: '600' }}>#{order.id.split('_')[1] || order.id}</td>
                    <td style={{ padding: '1rem' }}>
                       <span style={{ 
                         padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                         background: statusColors[order.status]?.bg || '#f1f5f9',
                         color: statusColors[order.status]?.text || '#475569'
                       }}>
                         {statusColors[order.status]?.label || order.status}
                       </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '700', color: '#1e293b' }}>R$ {(order.amount / 100).toFixed(2).replace('.', ',')}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                       <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>{order.customer?.name}</span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.customer?.email}</span>
                       </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                       <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><MoreHorizontal size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '6rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
             {/* ILUSTRAÇÃO DO CACTO ESTILO PAGARME */}
             <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '50%' }}></div>
                <div style={{ fontSize: '64px', filter: 'grayscale(0.5) opacity(0.3)', pointerEvents: 'none', userSelect: 'none' }}>🌵</div>
             </div>
             <div>
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>Nenhum pedido encontrado</h3>
                <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Parece que você ainda não tem transações com este filtro.</p>
             </div>
             <button onClick={fetchCobrancas} className="vini-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RefreshCcw size={16} /> Atualizar
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cobrancas;
