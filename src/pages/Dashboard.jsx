import React, { useMemo, useState, useEffect } from 'react';
import { 
  DollarSign, ShoppingCart, TrendingUp, Users, 
  Clock, Package, Star, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import api from '../services/api';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import '../styles/admin/dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgTicket: 0,
    newCustomers: 0,
    growth: 12.5
  });

  const [charts, setCharts] = useState({
    dailySales: [],
    paymentMethods: [],
    orderChannels: [
      { name: 'WhatsApp', value: 65 },
      { name: 'PDV Balcão', value: 25 },
      { name: 'iFood', value: 10 }
    ]
  });

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const resp = await api.get('/dashboard/stats');
      if (resp.success) {
        setStats(prev => ({ ...prev, ...resp.data }));
      }
      
      const chartsResp = await api.get('/dashboard/charts');
      if (chartsResp.success) {
        setCharts(prev => ({ ...prev, ...chartsResp.data }));
      }
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ['#EA1D2C', '#3b82f6', '#10b981', '#f59e0b'];

  if (loading) return <div className="loading-vini">Gerando Inteligência Artificial...</div>;

  return (
    <div className="vini-dashboard-premium animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Meu Desempenho 🚀</h1>
          <p>Visão geral de hoje para o Vini's Cloud</p>
        </div>
        <div className="date-picker-mock">
          <Clock size={16} /> Últimos 30 dias
        </div>
      </header>

      {/* KPI GRID */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrap bg-red-soft"><DollarSign size={20} color="#EA1D2C" /></div>
            <span className="kpi-badge positive"><ArrowUpRight size={12}/> {stats.growth}%</span>
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Faturamento Total</span>
            <h3 className="kpi-value">R$ {Number(stats.totalSales || 0).toFixed(2).replace('.', ',')}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrap bg-blue-soft"><ShoppingCart size={20} color="#3b82f6" /></div>
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Pedidos Realizados</span>
            <h3 className="kpi-value">{stats.totalOrders} <small>un.</small></h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrap bg-green-soft"><TrendingUp size={20} color="#10b981" /></div>
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Ticket Médio</span>
            <h3 className="kpi-value">R$ {Number(stats.avgTicket || (stats.totalSales / stats.totalOrders) || 0).toFixed(2).replace('.', ',')}</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrap bg-yellow-soft"><Users size={20} color="#f59e0b" /></div>
          </div>
          <div className="kpi-body">
            <span className="kpi-label">Novos Clientes</span>
            <h3 className="kpi-value">{stats.newCustomers || 0}</h3>
          </div>
        </div>
      </section>

      {/* MAIN CHARTS SECTION */}
      <div className="dashboard-main-layout">
        
        {/* EVOLUÇÃO DE VENDAS */}
        <div className="vini-chart-card main-area">
          <div className="chart-header">
            <h3>Evolução de Vendas</h3>
            <p>Faturamento diário em Reais</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={charts.dailySales}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA1D2C" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#EA1D2C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#EA1D2C', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="vendas" stroke="#EA1D2C" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CANAIS DE VENDA */}
        <div className="vini-chart-card side-pizza">
          <div className="chart-header">
            <h3>Canais de Venda</h3>
            <p>Origem dos pedidos</p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={charts.orderChannels}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.orderChannels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
               {charts.orderChannels.map((item, idx) => (
                 <div key={idx} className="legend-item">
                    <span className="dot" style={{ background: COLORS[idx] }}></span>
                    <span className="name">{item.name}</span>
                    <span className="val">{item.value}%</span>
                 </div>
               ))}
            </div>
          </div>
        </div>

      </div>

      <div className="dashboard-secondary-layout">
         {/* FORMAS DE PAGAMENTO */}
         <div className="vini-chart-card">
            <div className="chart-header">
              <h3>Formas de Pagamento</h3>
              <p>Preferência do cliente</p>
            </div>
            <div className="chart-container">
               <ResponsiveContainer width="100%" height={200}>
                 <BarChart data={charts.paymentMethods}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="metodo" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                    <YAxis axisLine={false} tickLine={false} hide />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="valor" fill="#EA1D2C" radius={[4, 4, 0, 0]} barSize={30} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* TOP PRODUTOS */}
         <div className="vini-chart-card">
            <div className="chart-header">
              <h3>Produtos Estrela ⭐</h3>
              <p>Os mais vendidos da semana</p>
            </div>
            <div className="top-product-list">
               {(charts.topProducts || []).slice(0, 4).map((prod, i) => (
                 <div key={i} className="prod-rank-item">
                    <div className="rank-num">{i+1}</div>
                    <div className="prod-info">
                       <span className="p-name">{prod.nome}</span>
                       <span className="p-qty">{prod.qtd} vendidos</span>
                    </div>
                    <div className="prod-trend"><TrendingUp size={14} color="#10b981"/></div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

export default Dashboard;
