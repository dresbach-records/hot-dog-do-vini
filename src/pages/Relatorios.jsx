import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Users, ChevronDown } from 'lucide-react';
import '../styles/admin/dashboard.css';

function Relatorios() {
  const faturamentoMensal = [
    { dia: '01/04', valor: 1200 },
    { dia: '02/04', valor: 1800 },
    { dia: '03/04', valor: 1550 },
    { dia: '04/04', valor: 2100 },
    { dia: '05/04', valor: 3200 }, // FDS
    { dia: '06/04', valor: 3800 }, // FDS
    { dia: '07/04', valor: 1100 },
  ];

  const vendasPorCategoria = [
    { name: 'Hot Dogs', vendas: 450 },
    { name: 'Combos', vendas: 210 },
    { name: 'Bebidas', vendas: 380 },
    { name: 'Porções', vendas: 90 },
    { name: 'Doces', vendas: 45 },
  ];

  const customTooltipStyle = {
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem'
  };

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem', background: 'var(--bg-base)' }}>
      <header className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2>Business Intelligence</h2>
          <p className="text-secondary">Visão panorâmica do faturamento, performance de produtos e crescimento.</p>
        </div>
        <div className="header-actions">
          <button className="vini-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Últimos 7 Dias <ChevronDown size={16} />
          </button>
          <button className="vini-btn-primary">
            Exportar XLS
          </button>
        </div>
      </header>

      {/* MÉTRICAS KPI */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-green-light">
            <DollarSign size={24} color="var(--c-green)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Receita Líquida (7d)</span>
            <h3 className="stat-value text-positive">R$ 14.750,00</h3>
            <span className="stat-trend positive"><TrendingUp size={14}/> +12.5% vs semana anterior</span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-blue-light">
            <ShoppingBag size={24} color="var(--c-blue)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Ticket Médio</span>
            <h3 className="stat-value">R$ 38,50</h3>
            <span className="stat-trend neutral">Estável</span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-yellow-light">
            <Users size={24} color="var(--c-yellow)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pedidos Concluídos</span>
            <h3 className="stat-value">383</h3>
            <span className="stat-trend positive">+5% vs semana anterior</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 2fr) minmax(300px, 1fr)', gap: '1.5rem' }}>
        
        {/* Gráfico de Faturamento */}
        <div className="vini-glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>Faturamento Diário</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Evolução da receita ao longo da semana</span>
          </div>
          <div style={{ width: '100%', minHeight: 300, flex: 1 }}>
            <ResponsiveContainer>
              <AreaChart data={faturamentoMensal} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--c-red)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--c-red)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="dia" stroke="var(--text-secondary)" fontSize={11} tickMargin={10} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} tickFormatter={(v) => `R$${v}`} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(value) => `R$ ${value}`} />
                <Area type="monotone" dataKey="valor" stroke="var(--c-red)" strokeWidth={3} fillOpacity={1} fill="url(#colorValor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Categorias */}
        <div className="vini-glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>Vendas por Categoria</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mix de produtos</span>
          </div>
          <div style={{ width: '100%', minHeight: 300, flex: 1 }}>
            <ResponsiveContainer>
              <BarChart data={vendasPorCategoria} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="vendas" fill="var(--c-blue)" radius={[0, 4, 4, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Relatorios;
