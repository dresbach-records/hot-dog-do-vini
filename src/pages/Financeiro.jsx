import { Plus, ArrowDownRight, Tag } from 'lucide-react';

function Financeiro() {
  return (
    <div className="dashboard-page animate-fade-in">
      <header className="page-header">
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

      <div className="caixa-content">
        <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="section-header-row">
            <h3>Histórico de Despesas</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="client-cell">
                      <div className="avatar bg-dark-layer"><Tag size={14} color="var(--text-muted)" /></div>
                      <span>Compra Salsicha (Fornecedor A)</span>
                    </div>
                  </td>
                  <td>Insumos</td>
                  <td>Hoje</td>
                  <td className="text-negative font-semibold">-R$ 340,00</td>
                  <td><span className="vini-badge-success" style={{ background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80' }}>Pago</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="client-cell">
                      <div className="avatar bg-dark-layer"><Tag size={14} color="var(--text-muted)" /></div>
                      <span>Conta de Luz - Filial Centro</span>
                    </div>
                  </td>
                  <td>Gastos Fixos</td>
                  <td>15/10/2023</td>
                  <td className="text-negative font-semibold">-R$ 850,00</td>
                  <td><span className="vini-badge-warning">A Vencer</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="side-panel">
          <div className="resumo-caixa vini-glass-panel">
            <h3>Resumo (Este Mês)</h3>
            <div className="resumo-stats">
              <div className="resumo-item">
                <span>Total em Insumos</span>
                <h4 className="text-negative">R$ 4.250,00</h4>
              </div>
              <div className="resumo-item">
                <span>Gastos Fixos</span>
                <h4 className="text-negative">R$ 2.150,00</h4>
              </div>
              <div className="divider"></div>
              <div className="resumo-item total">
                <span>Total de Despesas</span>
                <h4 className="text-negative">R$ 6.400,00</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Financeiro;
