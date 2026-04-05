import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Users, ChevronDown, AlertCircle } from 'lucide-react';
import { useClientes } from '../context/ClientesContext';
import '../styles/admin/dashboard.css';

function Relatorios() {
  const { clientes, resumo, loading } = useClientes();

  // Dados para o gráfico de Pizza (Pago vs Aberto)
  const dataPizza = [
    { name: 'Recebido', value: resumo.total_recebido_confirmado || 0, color: 'var(--c-green)' },
    { name: 'Em Aberto', value: resumo.total_em_aberto_estimado || 0, color: 'var(--c-red)' }
  ];

  // Dados para o gráfico de Barras (Top Devedores)
  const topDevedores = clientes
    .filter(c => Number(c.saldo_devedor) > 0)
    .sort((a, b) => b.saldo_devedor - a.saldo_devedor)
    .slice(0, 5)
    .map(c => ({
      name: c.nome.split(' ')[0],
      valor: Number(c.saldo_devedor)
    }));

  const customTooltipStyle = {
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem'
  };

  if (loading) return <div className="p-8 text-center">Carregando dados financeiros...</div>;

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem', background: 'var(--bg-base)' }}>
      <header className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2>Business Intelligence</h2>
          <p className="text-secondary">Visão real baseada no faturamento e débitos sincronizados.</p>
        </div>
        <div className="header-actions">
          <button className="vini-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Dados em Tempo Real <ChevronDown size={16} />
          </button>
        </div>
      </header>

      {/* MÉTRICAS KPI REAIS */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-blue-light">
            <DollarSign size={24} color="var(--c-blue)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Vendido</span>
            <h3 className="stat-value">R$ {(resumo.total_vendas_estimado || 0).toFixed(2).replace('.', ',')}</h3>
            <span className="stat-trend neutral">Resumo Geral</span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-green-light">
            <TrendingUp size={24} color="var(--c-green)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Recebido</span>
            <h3 className="stat-value text-positive">R$ {(resumo.total_recebido_confirmado || 0).toFixed(2).replace('.', ',')}</h3>
            <span className="stat-trend positive">Dinheiro no Caixa</span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div className="stat-icon-wrapper bg-red-light">
            <AlertCircle size={24} color="var(--c-red)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total em Aberto</span>
            <h3 className="stat-value text-negative">R$ {(resumo.total_em_aberto_estimado || 0).toFixed(2).replace('.', ',')}</h3>
            <span className="stat-trend negative">Valores Pendentes</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Gráfico Pago vs Aberto */}
        <div className="vini-glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1.5rem', width: '100%' }}>Saúde Financeira</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dataPizza}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} formatter={(value) => `R$ ${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--c-green)' }}></div>
              <span style={{ fontSize: '0.85rem' }}>Recebido</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--c-red)' }}></div>
              <span style={{ fontSize: '0.85rem' }}>Em Aberto</span>
            </div>
          </div>
        </div>

        {/* Gráfico Ranking Devedores */}
        <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Maiores Valores Pendentes</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={topDevedores} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Bar dataKey="valor" fill="var(--c-red)" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Relatorios;
