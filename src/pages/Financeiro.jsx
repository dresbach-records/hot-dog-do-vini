import React, { useState, useEffect } from 'react';
import { Plus, Tag, ArrowDownRight, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { despesas } from '../services/api';
import '../styles/admin/dashboard.css';

function Financeiro() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_mes: 0, insumos: 0, a_vencer: 0 });

  useEffect(() => {
    fetchDespesas();
  }, []);

  const fetchDespesas = async () => {
    setLoading(true);
    try {
      const response = await despesas.list();
      if (response.success) {
        const data = response.data || [];
        setItems(data);
        
        // Calcular estatísticas simples
        const total = data.reduce((acc, curr) => acc + Number(curr.valor), 0);
        const insumos = data.filter(d => d.categoria === 'Insumos').reduce((acc, curr) => acc + Number(curr.valor), 0);
        const aVencer = data.filter(d => !d.pago).reduce((acc, curr) => acc + Number(curr.valor), 0);
        
        setStats({ total_mes: total, insumos, a_vencer: aVencer });
      }
    } catch (err) {
      console.error('Erro ao buscar despesas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDespesa = async () => {
    const descricao = window.prompt('Descrição da despesa:');
    if (!descricao) return;
    const valor = window.prompt('Valor (R$):');
    if (!valor) return;
    const categoria = window.prompt('Categoria (Insumos, Fixo, Outros):', 'Insumos');
    
    try {
      const response = await despesas.create({
        descricao,
        valor: parseFloat(valor.replace(',', '.')),
        categoria,
        pago: true,
        data_pagamento: new Date().toISOString().split('T')[0]
      });
      if (response.success) fetchDespesas();
    } catch (err) {
      alert('Erro ao criar despesa: ' + err);
    }
  };

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem', background: 'var(--bg-base)' }}>
      <header className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2>Despesas & Insumos</h2>
          <p className="text-secondary">Registro de gastos fixos, compras de insumos e contas a pagar.</p>
        </div>
        <div className="header-actions">
          <button className="vini-btn-primary" onClick={handleCreateDespesa} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Lançar Despesa
          </button>
        </div>
      </header>

      {/* METRICAS */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-red-light">
            <TrendingDown size={24} color="var(--c-red)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Despesas Totais</span>
            <h3 className="stat-value text-negative">R$ {stats.total_mes.toFixed(2).replace('.', ',')}</h3>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-blue-light">
            <DollarSign size={24} color="var(--c-blue)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Insumos</span>
            <h3 className="stat-value">R$ {stats.insumos.toFixed(2).replace('.', ',')}</h3>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-yellow-light">
            <Wallet size={24} color="var(--c-yellow)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Contas em Aberto</span>
            <h3 className="stat-value text-negative">R$ {stats.a_vencer.toFixed(2).replace('.', ',')}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 2fr) minmax(300px, 1fr)', gap: '1.5rem' }}>
        <div className="vini-glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="section-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0 }}>Histórico Recente</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-active)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Descrição</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Categoria</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Data</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Valor</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div className="client-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div className="avatar bg-dark-layer" style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-active)' }}>
                          <Tag size={16} color="var(--text-secondary)" />
                        </div>
                        <strong style={{ display: 'block' }}>{item.descricao}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.categoria}</td>
                    <td style={{ padding: '1rem' }}>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--c-red)' }}>-R$ {Number(item.valor).toFixed(2).replace('.', ',')}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`vini-badge ${item.pago ? 'success' : 'warning'}`} style={{ 
                        background: item.pago ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                        color: item.pago ? 'var(--c-green)' : 'var(--c-yellow)' 
                      }}>
                        {item.pago ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Sem despesas lançadas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="side-panel">
          <div className="resumo-caixa vini-glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-surface-elevated)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Resumo Geral</h3>
            <div className="resumo-stats" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="resumo-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total em Insumos</span>
                <h4 style={{ margin: 0, fontWeight: '500' }}>R$ {stats.insumos.toFixed(2).replace('.', ',')}</h4>
              </div>
              <div className="divider" style={{ borderTop: '1px dashed var(--border-color)', margin: '0.5rem 0' }}></div>
              <div className="resumo-item total" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600' }}>Total Acumulado</span>
                <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--c-red)' }}>R$ {stats.total_mes.toFixed(2).replace('.', ',')}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Financeiro;
