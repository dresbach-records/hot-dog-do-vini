import { FileCheck, Users as UsersIcon } from 'lucide-react';

function RH() {
  return (
    <div className="dashboard-page animate-fade-in">
      <header className="page-header">
        <div>
          <h2>Portal de RH</h2>
          <p className="text-secondary">Gestão de sua equipe operando as filiais Vini's.</p>
        </div>
      </header>

      <div className="caixa-content">
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="section-header-row">
            <h3>Quadro de Colaboradores</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cargo</th>
                  <th>Filial Base</th>
                  <th>Status</th>
                  <th>Próx. Férias</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div className="client-cell">
                      <div className="avatar bg-red-light"><UsersIcon size={14} color="var(--c-red)" /></div>
                      <span>Ana Silva</span>
                    </div>
                  </td>
                  <td>Atendente</td>
                  <td>Filial Centro (Matriz)</td>
                  <td><span className="badge success">Ativo</span></td>
                  <td>Nov/2024</td>
                </tr>
                <tr>
                  <td>
                    <div className="client-cell">
                      <div className="avatar bg-yellow-light"><UsersIcon size={14} color="var(--c-yellow)" /></div>
                      <span>Beto Campos</span>
                    </div>
                  </td>
                  <td>Chapeiro</td>
                  <td>Filial Sul</td>
                  <td><span className="badge success">Ativo</span></td>
                  <td>Jan/2025</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="side-panel">
          <div className="resumo-caixa glass-panel">
            <h3>Documentos (Avisos)</h3>
            <div className="resumo-stats">
               <div className="resumo-item">
                 <div className="client-cell">
                    <FileCheck size={16} color="var(--c-yellow)" />
                    <span>Fechamento da folha (Out)</span>
                 </div>
                 <span className="badge warning" style={{width: 'max-content'}}>Pendente</span>
               </div>
               <div className="resumo-item" style={{ marginTop: '1rem' }}>
                 <div className="client-cell">
                    <FileCheck size={16} color="#4ade80" />
                    <span>ASO Ana Silva</span>
                 </div>
                 <span className="badge success" style={{width: 'max-content'}}>Em dia</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RH;
