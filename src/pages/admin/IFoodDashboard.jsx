import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Truck, 
  Star, 
  DollarSign, 
  LayoutDashboard, 
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import ifoodService from '../../services/ifood/ifoodService';
import '../../styles/admin/dashboard.css';

const IFoodDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [status, setStatus] = useState({ connected: false, merchants: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const res = await ifoodService.getStatus();
      if (res.success) {
        setStatus(res);
        // Auto-inicializa o widget se houver merchants conectados
        if (res.merchants?.length > 0) {
          const mIds = res.merchants.map(m => m.id);
          ifoodService.initWidget(mIds);
        }
      }
    } catch (err) {
      console.error('[iFood Dashboard] Erro ao carregar status:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Início', icon: LayoutDashboard },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
    { id: 'logistics', label: 'Logística', icon: Truck },
    { id: 'reviews', label: 'Reputação', icon: Star },
    { id: 'finance', label: 'Financeiro', icon: DollarSign },
  ];

  if (loading) return <div className="loading-vini">Carregando Command Center iFood...</div>;

  return (
    <div className="vini-dashboard-premium animate-fade-in" style={{ padding: '2rem' }}>
      {/* HEADER INDUSTRIAL */}
      <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="https://logodownload.org/wp-content/uploads/2017/05/ifood-logo-1.png" alt="iFood" style={{ height: '24px' }} />
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>Command Center</h1>
          </div>
          <p className="text-secondary" style={{ color: '#64748b' }}>Gestão de Elite conectada via Merchant API v2/v3</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div className={`vini-badge ${status.connected ? 'success' : 'danger'}`} style={{ padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} />
            {status.connected ? 'MOTOR OPERACIONAL' : 'MOTOR DESCONECTADO'}
          </div>
          <button onClick={fetchInitialData} className="vini-btn-outline icon-only" style={{ borderRadius: '12px' }}>
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* NAVIGATION TABS (GLASSMORPHISM) */}
      <nav style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '2.5rem', 
        background: 'rgba(255, 255, 255, 0.4)', 
        backdropFilter: 'blur(10px)',
        padding: '6px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        width: 'fit-content'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === tab.id ? '#EA1D2C' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#64748b',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* TAB CONTENT RENDERING */}
      <div className="tab-content">
        {activeTab === 'overview' && <OverviewTab status={status} />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'logistics' && <LogisticsTab status={status} />}
        {activeTab === 'reviews' && <ReviewsTab />}
        {activeTab === 'finance' && <FinanceTab />}
      </div>
    </div>
  );
};

/* --- MINI COMPONENTS (TABS) --- */

const OverviewTab = ({ status }) => {
  return (
    <div className="animate-fade-in">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrap bg-red-soft"><ShoppingBag color="#EA1D2C" /></div>
            <div className="kpi-badge positive">+12%</div>
          </div>
          <div className="kpi-label">Pedidos Hoje</div>
          <div className="kpi-value">42</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrap bg-yellow-soft"><Star color="#ca8a04" /></div>
          </div>
          <div className="kpi-label">Nota Média</div>
          <div className="kpi-value">4.8 <small>/ 5.0</small></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrap bg-green-soft"><DollarSign color="#16a34a" /></div>
          </div>
          <div className="kpi-label">GMV Mensal (Est.)</div>
          <div className="kpi-value">R$ 12.450 <small>,00</small></div>
        </div>
      </div>

      <div className="dashboard-main-layout">
        <div className="vini-chart-card">
          <div className="chart-header">
            <h3>Status das Lojas</h3>
            <p>Monitoramento em tempo real dos merchants integrados</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {status.merchants && status.merchants.map((m, idx) => (
              <div key={idx} style={{ 
                padding: '1.25rem', 
                background: '#f8fafc', 
                borderRadius: '16px', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{m.name || 'Loja Principal'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>ID: {m.id}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <span className={`vini-badge ${m.available ? 'success' : 'neutral'}`}>
                     {m.available ? 'ABERTA' : 'FECHADA'}
                   </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await ifoodService.listOrders();
      if (res.success) setOrders(res.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in vini-chart-card">
      <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>Pedidos Ativos</h3>
          <p>Acompanhamento do ciclo de vida iFood</p>
        </div>
        <button className="vini-btn-outline" onClick={loadOrders} disabled={loading}>
           {loading ? 'Sincronizando...' : 'Sincronizar Agora'}
        </button>
      </div>

      <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '12px', color: '#64748b', fontSize: '0.85rem' }}>PEDIDO</th>
              <th style={{ padding: '12px', color: '#64748b', fontSize: '0.85rem' }}>CLIENTE</th>
              <th style={{ padding: '12px', color: '#64748b', fontSize: '0.85rem' }}>HORÁRIO</th>
              <th style={{ padding: '12px', color: '#64748b', fontSize: '0.85rem' }}>TOTAL</th>
              <th style={{ padding: '12px', color: '#64748b', fontSize: '0.85rem' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Nenhum pedido ativo no momento.
                </td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px', fontWeight: '700' }}>#{order.displayId}</td>
                  <td style={{ padding: '12px' }}>{order.customer.name}</td>
                  <td style={{ padding: '12px' }}>{new Date(order.createdAt).toLocaleTimeString()}</td>
                  <td style={{ padding: '12px' }}>R$ {order.total.amount.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>
                    <span className="vini-badge neutral">{order.fullCode}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LogisticsTab = ({ status }) => {
  const [init, setInit] = useState(false);

  const startWidget = async () => {
    const merchantIds = status.merchants.map(m => m.id);
    const widgetId = '550c1fdc-4741-415d-a1c5-0c624fba86fa'; // Exemplo baseado no ClientID ou UUID real
    await ifoodService.initWidget(merchantIds, widgetId);
    setInit(true);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
       <div className="vini-chart-card">
         <div className="chart-header">
           <h3>Apoio à Entrega (Shipping)</h3>
           <p>Solicite entregadores iFood para pedidos externos</p>
         </div>
         <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
            <Truck size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#64748b' }}>Configure um pedido para cotar frete iFood On-Demand.</p>
            <button className="vini-btn-primary" style={{ background: '#EA1D2C', border: 'none', padding: '10px 24px', borderRadius: '12px', fontWeight: '700' }}>
              Nova Entrega Externa
            </button>
         </div>
       </div>

       <div className="vini-chart-card">
         <div className="chart-header">
           <h3>iFood Widget</h3>
           <p>Chat e Rastreio Integrado</p>
         </div>
         <div style={{ padding: '2rem', textAlign: 'center' }}>
            {init ? (
               <div className="vini-badge success" style={{ padding: '20px' }}>
                 WIDGET CARREGADO NO OVERLAY
               </div>
            ) : (
              <button onClick={startWidget} className="vini-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}>
                <MessageCircle size={18} /> Inicializar Chat & Live Tracking
              </button>
            )}
            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
              O widget permite conversar com clientes e entregadores diretamente no ERP.
            </p>
         </div>
       </div>
    </div>
  );
};

const ReviewsTab = () => {
  return (
    <div className="animate-fade-in vini-chart-card">
      <div className="chart-header">
        <h3>Gestão de Reputação (V2)</h3>
        <p>Acompanhe e responda avaliações dos consumidores</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
         <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= 4 ? "#ca8a04" : "none"} color="#ca8a04" />)}
              </div>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Hoje, 14:20</span>
            </div>
            <p style={{ fontWeight: '600', color: '#1e293b' }}>"Comida excelente, mas o entregador demorou um pouco."</p>
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span className="vini-badge neutral">PEDIDO #1234</span>
               <button className="vini-btn-primary" style={{ fontSize: '0.85rem', background: '#EA1D2C', border: 'none' }}>Responder (v2)</button>
            </div>
         </div>
         <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
           Você possui 2 avaliações aguardando resposta (Prazo: 5 dias).
         </div>
      </div>
    </div>
  );
};

const FinanceTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const res = await ifoodService.getFinanceConsolidation();
        if (res.success) setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinance();
  }, []);

  if (loading) return <div style={{ padding: '60px', textAlign: 'center' }}>Calculando consolidação financeira V3...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
       <div className="vini-chart-card">
          <div className="chart-header">
            <h3>Faturamento Mensal</h3>
            <p>Consolidado Industrial (V3)</p>
          </div>
          <div style={{ marginTop: '2rem' }}>
             <div className="kpi-label">A Receber do iFood</div>
             <div className="kpi-value" style={{ color: '#16a34a' }}>R$ {(data?.netPayable || 0).toFixed(2).replace('.', ',')}</div>
             <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                   <span style={{ color: '#64748b' }}>Impacto Online</span>
                   <span style={{ fontWeight: '700' }}>R$ {(data?.impactoOnline || 0).toFixed(2).replace('.', ',')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                   <span style={{ color: '#64748b' }}>Comissões e Débitos</span>
                   <span style={{ fontWeight: '700', color: '#EA1D2C' }}>- R$ {(data?.comissoes || 0).toFixed(2).replace('.', ',')}</span>
                </div>
                <div style={{ padding: '10px 0', borderTop: '1px solid #f1f5f9' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                   <span style={{ color: '#64748b' }}>Saldo "Sem Impacto"</span>
                   <span style={{ fontWeight: '700', color: '#64748b' }}>R$ {(data?.semImpacto || 0).toFixed(2).replace('.', ',')}</span>
                </div>
             </div>
          </div>
       </div>

       <div className="vini-chart-card">
          <div className="chart-header">
            <h3>Inteligência de Vendas</h3>
            <p>Separação de canais de recebimento</p>
          </div>
          <div style={{ padding: '2rem' }}>
             <div style={{ display: 'flex', gap: '2rem' }}>
                <div style={{ flex: 1, padding: '1.5rem', background: '#f8fafc', borderRadius: '16px' }}>
                   <small style={{ color: '#64748b', fontWeight: '700' }}>TOTAL GMV</small>
                   <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a' }}>
                      R$ {(data?.totalGMV || 0).toFixed(2).replace('.', ',')}
                   </div>
                </div>
                <div style={{ flex: 1, padding: '1.5rem', background: '#f8fafc', borderRadius: '16px' }}>
                   <small style={{ color: '#64748b', fontWeight: '700' }}>PEDIDOS</small>
                   <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a' }}>
                      {data?.vendasCount || 0}
                   </div>
                </div>
             </div>
             <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
               O saldo "Sem Impacto" refere-se a pagamentos acolhidos pelo restaurante (Dinheiro, VA/VR na entrega). 
               Esses valores já estão no seu caixa e não transitam pela conta do iFood.
             </p>
          </div>
       </div>
    </div>
  );
};

export default IFoodDashboard;
