import { Store } from 'lucide-react';

function Filiais() {
  return (
    <div className="dashboard-page animate-fade-in">
      <header className="page-header">
        <div>
          <h2>Gestão de Filiais</h2>
          <p className="text-secondary">Visão geral logística, faturamento e metas das unidades.</p>
        </div>
      </header>

      <div className="caixa-content">
        <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="section-header-row">
            <h3>Unidades Vini's</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome da Filial</th>
                  <th>Responsável</th>
                  <th>Meta Atual</th>
                  <th>Performance</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="client-cell">
                      <div className="avatar bg-red-light"><Store size={14} color="var(--c-red)" /></div>
                      <span>Filial Centro (Matriz)</span>
                    </div>
                  </td>
                  <td>Vini / Ana</td>
                  <td>R$ 40.000,00</td>
                  <td><span className="text-positive">+8% acima</span></td>
                  <td><span className="vini-badge-success">Operando</span></td>
                </tr>
                <tr>
                  <td>
                    <div className="client-cell">
                      <div className="avatar bg-yellow-light"><Store size={14} color="var(--c-yellow)" /></div>
                      <span>Filial Sul (Shopping)</span>
                    </div>
                  </td>
                  <td>Carlos</td>
                  <td>R$ 25.000,00</td>
                  <td><span className="text-negative">-2% abaixo</span></td>
                  <td><span className="vini-badge-success">Operando</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Filiais;
