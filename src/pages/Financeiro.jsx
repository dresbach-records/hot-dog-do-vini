import { Plus, Tag, ArrowDownRight, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import '../styles/admin/dashboard.css';

function Financeiro() {
  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem', background: 'var(--bg-base)' }}>
      <header className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2>Despesas & Insumos</h2>
          <p className="text-secondary">Registro de gastos fixos, compras de insumos e contas a pagar.</p>
        </div>
        <div className="header-actions">
          <button className="vini-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
            <span className="stat-label">Despesas Totais (Mês)</span>
            <h3 className="stat-value text-negative">R$ 6.400,00</h3>
            <span className="stat-trend negative">32% da receita bruta</span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-blue-light">
            <DollarSign size={24} color="var(--c-blue)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Insumos (Custos Variáveis)</span>
            <h3 className="stat-value">R$ 4.250,00</h3>
            <span className="stat-trend positive">Margem sob controle</span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-yellow-light">
            <Wallet size={24} color="var(--c-yellow)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Contas a Vencer</span>
            <h3 className="stat-value text-negative">R$ 850,00</h3>
            <span className="stat-trend neutral">Vencem nos próximos 7 dias</span>
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
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div className="client-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div className="avatar bg-dark-layer" style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-active)' }}>
                        <Tag size={16} color="var(--text-secondary)" />
                      </div>
                      <strong style={{ display: 'block' }}>Compra Salsicha (Fornecedor A)</strong>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Insumos</td>
                  <td style={{ padding: '1rem' }}>Hoje</td>
                  <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--c-red)' }}>-R$ 340,00</td>
                  <td style={{ padding: '1rem' }}><span className="vini-badge success" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--c-green)' }}>Pago</span></td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem' }}>
                    <div className="client-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div className="avatar bg-dark-layer" style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-active)' }}>
                        <Tag size={16} color="var(--text-secondary)" />
                      </div>
                      <strong style={{ display: 'block' }}>Conta de Luz - Filial Centro</strong>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Gastos Fixos</td>
                  <td style={{ padding: '1rem' }}>15/10/2023</td>
                  <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--c-red)' }}>-R$ 850,00</td>
                  <td style={{ padding: '1rem' }}><span className="vini-badge warning" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--c-yellow)' }}>A Vencer</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="side-panel">
          <div className="resumo-caixa vini-glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-surface-elevated)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Resumo (Este Mês)</h3>
            <div className="resumo-stats" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="resumo-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total em Insumos</span>
                <h4 style={{ margin: 0, fontWeight: '500' }}>R$ 4.250,00</h4>
              </div>
              <div className="resumo-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Gastos Fixos</span>
                <h4 style={{ margin: 0, fontWeight: '500' }}>R$ 2.150,00</h4>
              </div>
              <div className="divider" style={{ borderTop: '1px dashed var(--border-color)', margin: '0.5rem 0' }}></div>
              <div className="resumo-item total" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600' }}>Total de Despesas</span>
                <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--c-red)' }}>R$ 6.400,00</h4>
              </div>
            </div>
            
            <button className="vini-btn-outline" style={{ width: '100%', marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <ArrowDownRight size={16} /> Ver PDF / Balanço
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Financeiro;
