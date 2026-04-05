import { FileCheck, Users as UsersIcon, UserCheck, Briefcase, Calendar } from 'lucide-react';
import '../styles/admin/dashboard.css';

function RH() {
  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem', background: 'var(--bg-base)' }}>
      <header className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2>Portal de RH</h2>
          <p className="text-secondary">Gestão de sua equipe operando as filiais Vini's.</p>
        </div>
        <div className="header-actions">
           <button className="vini-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            + Novo Colaborador
          </button>
        </div>
      </header>

      {/* METRICAS */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-blue-light">
            <UsersIcon size={24} color="var(--c-blue)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total de Colaboradores</span>
            <h3 className="stat-value">12</h3>
            <span className="stat-trend positive">Time crescendo</span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-green-light">
            <UserCheck size={24} color="var(--c-green)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Colaboradores Ativos</span>
            <h3 className="stat-value">11</h3>
            <span className="stat-trend negative">1 Afastado (INSS)</span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-yellow-light">
            <Briefcase size={24} color="var(--c-yellow)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Folha de Pagamento</span>
            <h3 className="stat-value">R$ 18.500</h3>
            <span className="stat-trend neutral">Fechamento dia 05</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 2fr) minmax(300px, 1fr)', gap: '1.5rem' }}>
        <div className="vini-glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="section-header" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0 }}>Quadro de Colaboradores</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-active)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Nome</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Cargo</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Filial Base</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Férias</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div className="client-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div className="avatar bg-red-light" style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.15)' }}>
                        <UsersIcon size={16} color="var(--c-red)" />
                      </div>
                      <strong style={{ display: 'block' }}>Ana Silva</strong>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Atendente</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Centro (Matriz)</td>
                  <td style={{ padding: '1rem' }}><span className="vini-badge success" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--c-green)' }}>Ativo</span></td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Nov/2024</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem' }}>
                    <div className="client-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div className="avatar bg-yellow-light" style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245, 158, 11, 0.15)' }}>
                        <UsersIcon size={16} color="var(--c-yellow)" />
                      </div>
                      <strong style={{ display: 'block' }}>Beto Campos</strong>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Chapeiro</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Filial Sul</td>
                  <td style={{ padding: '1rem' }}><span className="vini-badge success" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--c-green)' }}>Ativo</span></td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Jan/2025</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="side-panel">
          <div className="resumo-caixa vini-glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-surface-elevated)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Documentos (Avisos)</h3>
            <div className="resumo-stats" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
               <div className="resumo-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                 <div className="client-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <FileCheck size={18} color="var(--c-yellow)" />
                    <span style={{ fontWeight: '500' }}>Folha (Out)</span>
                 </div>
                 <span className="vini-badge warning" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--c-yellow)' }}>Pendente</span>
               </div>
               
               <div className="resumo-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                 <div className="client-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <FileCheck size={18} color="var(--c-green)" />
                    <span style={{ fontWeight: '500' }}>ASO Ana Silva</span>
                 </div>
                 <span className="vini-badge success" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--c-green)' }}>Em dia</span>
               </div>

               <div className="resumo-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                 <div className="client-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <Calendar size={18} color="var(--c-blue)" />
                    <span style={{ fontWeight: '500' }}>Escala (Nov)</span>
                 </div>
                 <span className="vini-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--c-blue)' }}>Aprovada</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RH;
