import React, { useState } from 'react';
import { 
  Building2, User, Check, X, Clock, Plus, Search, 
  DollarSign, Briefcase, FileText, AlertCircle, TrendingUp
} from 'lucide-react';
import { useClientes } from '../context/ClientesContext';
import '../styles/admin/convenios.css';

function ConveniosAdmin() {
  const { clientes, empresas, solicitacoes, gerenciarSolicitacao, loading } = useClientes();
  const [activeTab, setActiveTab] = useState('solicitacoes'); // 'solicitacoes' | 'empresas'
  const [searchTerm, setSearchTerm] = useState('');

  const pendentes = solicitacoes.filter(s => s.status === 'pendente_gestor');

  const handleSolicitacao = async (sol, status) => {
    const motive = status === 'rejeitado' ? window.prompt('Motivo da rejeição:') : '';
    if (status === 'rejeitado' && motive === null) return;

    if (window.confirm(`Deseja ${status === 'ativo' ? 'APROVAR' : 'REJEITAR'} esta solicitação?`)) {
        // Agora passando o clienteId corretamente
        const infoExtra = status === 'ativo' ? { limite: 500 } : { motivo: motive };
        await gerenciarSolicitacao(sol.id, sol.cliente_id, status, infoExtra);
    }
  };

  const renderSolicitacoes = () => (
    <div className="table-responsive">
      <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg-active)', borderBottom: '1px solid var(--border-color)' }}>
            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Colaborador</th>
            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Empresa Solicitada</th>
            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Data Solicitação</th>
            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Status</th>
            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {solicitacoes
            .filter(s => s.status === 'pendente_gestor' || activeTab === 'historico_solicitacoes' || true) // Simplified Filter
            .map((sol, i) => {
              const cliente = clientes.find(c => c.id === sol.cliente_id);
              const empresa = empresas.find(e => e.id === sol.empresa_id);

              if (activeTab === 'solicitacoes' && sol.status !== 'pendente_gestor') return null;

              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="avatar bg-blue-light" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={18} color="var(--c-blue)" />
                      </div>
                      <div>
                        <span style={{ fontWeight: '600', display: 'block' }}>{sol.dados_funcionario?.nome || cliente?.nome}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CPF: {sol.dados_funcionario?.cpf}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '600' }}>{empresa?.nome || 'Empresa desconhecida'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CNPJ: {empresa?.cnpj}</div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                    {new Date(sol.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`vini-badge ${sol.status === 'pendente_gestor' ? 'warning' : sol.status === 'ativo' ? 'success' : 'danger'}`}>
                       {sol.status === 'pendente_gestor' ? 'Pendente' : sol.status === 'ativo' ? 'Ativo' : 'Rejeitado'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {sol.status === 'pendente_gestor' && (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="vini-btn-action success" onClick={() => handleSolicitacao(sol, 'ativo')} title="Aprovar">
                          <Check size={16} />
                        </button>
                        <button className="vini-btn-action danger" onClick={() => handleSolicitacao(sol, 'rejeitado')} title="Rejeitar">
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          {solicitacoes.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Nenhuma solicitação pendente.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmpresa, setNewEmpresa] = useState({ nome: '', cnpj: '', limite_sugerido: 500 });

  const handleCreateEmpresa = async (e) => {
    e.preventDefault();
    const result = await adicionarEmpresa(newEmpresa);
    if (result.success) {
      setIsModalOpen(false);
      setNewEmpresa({ nome: '', cnpj: '', limite_sugerido: 500 });
      alert('Empresa cadastrada com sucesso!');
    } else {
      alert('Erro ao cadastrar empresa.');
    }
  };

  const renderEmpresas = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', padding: '1rem' }}>
        {empresas.map((emp, i) => {
          const numFuncionarios = clientes.filter(c => c.convenio_empresa_id === emp.id && c.convenio_status === 'ativo').length;
          return (
            <div key={i} className="vini-glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                   <div style={{ background: emp.cor_primaria || 'var(--c-blue)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Building2 size={24} />
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <span className={`vini-badge ${emp.ativo ? 'success' : 'secondary'}`}>{emp.ativo ? 'ATIVA' : 'INATIVA'}</span>
                   </div>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.2rem' }}>{emp.nome}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>CNPJ: {emp.cnpj}</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                   <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Colaboradores</div>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{numFuncionarios} ativos</div>
                   </div>
                   <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Limite Sugerido</div>
                      <div style={{ fontWeight: '700', color: 'var(--c-green)' }}>R$ {Number(emp.limite_sugerido || 0).toFixed(2)}</div>
                   </div>
                </div>
            </div>
          );
        })}
        <button 
           className="vini-glass-panel" 
           style={{ border: '2px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem', cursor: 'pointer', background: 'transparent' }}
           onClick={() => setIsModalOpen(true)}
        >
           <Plus size={32} color="var(--text-muted)" />
           <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Nova Empresa Parceira</span>
        </button>

        {isModalOpen && (
          <div className="vini-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div className="vini-glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Cadastrar Empresa</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
              </div>
              <form onSubmit={handleCreateEmpresa} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nome da Empresa</label>
                  <input type="text" value={newEmpresa.nome} onChange={e => setNewEmpresa({...newEmpresa, nome: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>CNPJ</label>
                  <input type="text" value={newEmpresa.cnpj} onChange={e => setNewEmpresa({...newEmpresa, cnpj: e.target.value})} placeholder="00.000.000/0001-00" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Limite de Crédito Sugerido</label>
                  <input type="number" value={newEmpresa.limite_sugerido} onChange={e => setNewEmpresa({...newEmpresa, limite_sugerido: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)', color: '#fff' }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '12px' }}>Salvar Empresa</button>
              </form>
            </div>
          </div>
        )}
    </div>
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Convênios Corporativos</h2>
          <p>Módulo de benefícios e gestão de empresas parceiras.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <div className="stats-mini-list" style={{ display: 'flex', gap: '1.5rem', marginRight: '2rem' }}>
              <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Faturamento Convênio</div>
                 <div style={{ fontWeight: '800', color: 'var(--c-green)', fontSize: '1.1rem' }}>R$ 12.450,00</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Saldo em Aberto</div>
                 <div style={{ fontWeight: '800', color: 'var(--c-red)', fontSize: '1.1rem' }}>R$ 4.210,00</div>
              </div>
           </div>
        </div>
      </header>

      <div className="dashboard-content" style={{ display: 'block' }}>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
           <button 
             onClick={() => setActiveTab('solicitacoes')}
             style={{ 
               background: 'none', border: 'none', borderBottom: activeTab === 'solicitacoes' ? '3px solid var(--c-blue)' : '3px solid transparent',
               padding: '0.5rem 1rem', fontWeight: '700', fontSize: '1rem', color: activeTab === 'solicitacoes' ? 'var(--c-blue)' : 'var(--text-muted)', cursor: 'pointer'
             }}
           >
             Solicitações Pendentes {pendentes.length > 0 && <span style={{ marginLeft: '8px', background: 'var(--c-red)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px' }}>{pendentes.length}</span>}
           </button>
           <button 
             onClick={() => setActiveTab('empresas')}
             style={{ 
               background: 'none', border: 'none', borderBottom: activeTab === 'empresas' ? '3px solid var(--c-blue)' : '3px solid transparent',
               padding: '0.5rem 1rem', fontWeight: '700', fontSize: '1rem', color: activeTab === 'empresas' ? 'var(--c-blue)' : 'var(--text-muted)', cursor: 'pointer'
             }}
           >
             Empresas Parceiras
           </button>
        </div>

        {activeTab === 'solicitacoes' ? (
           <div className="vini-glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              {renderSolicitacoes()}
           </div>
        ) : (
           renderEmpresas()
        )}
      </div>
    </div>
  );
}

export default ConveniosAdmin;
