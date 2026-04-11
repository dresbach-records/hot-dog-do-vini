import React, { useState, useEffect } from 'react';
import { FileCheck, Users as UsersIcon, UserCheck, Briefcase, Calendar, Trash2, Plus } from 'lucide-react';
import { rh } from '../services/api';
import '../styles/admin/dashboard.css';

function RH() {
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nome: '', cargo: '', salario: '', data_admissao: '', status: 'ativo' });

  useEffect(() => {
    fetchEquipe();
  }, []);

  const fetchEquipe = async () => {
    setLoading(true);
    try {
      const resp = await rh.list();
      if (resp.success) setColaboradores(resp.data);
    } catch (err) {
      console.error('Erro ao carregar RH:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const resp = await rh.create(formData);
      if (resp.success) {
        setShowModal(false);
        setFormData({ nome: '', cargo: '', salario: '', data_admissao: '', status: 'ativo' });
        fetchEquipe();
      }
    } catch (err) {
      alert('Erro ao salvar colaborador');
    }
  };

  const handleExcluir = async (id) => {
    if (!window.confirm('Deseja remover este colaborador?')) return;
    try {
      const resp = await rh.delete(id);
      if (resp.success) fetchEquipe();
    } catch (err) {
      alert('Erro ao excluir');
    }
  };

  const metrics = {
    total: colaboradores.length,
    ativos: colaboradores.filter(c => c.status === 'ativo').length,
    folha: colaboradores.reduce((acc, curr) => acc + Number(curr.salario || 0), 0)
  };

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem', background: 'var(--bg-base)' }}>
      <header className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2>Portal de RH</h2>
          <p className="text-secondary">Gestão de sua equipe operando as filiais Vini's.</p>
        </div>
        <div className="header-actions">
           <button onClick={() => setShowModal(true)} className="vini-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Novo Colaborador
          </button>
        </div>
      </header>

      {/* METRICAS REAIS */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper blue">
            <UsersIcon size={24} color="var(--c-blue)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total de Colaboradores</span>
            <h3 className="stat-value">{metrics.total}</h3>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper green">
            <UserCheck size={24} color="var(--c-green)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Colaboradores Ativos</span>
            <h3 className="stat-value">{metrics.ativos}</h3>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper yellow">
            <Briefcase size={24} color="var(--c-yellow)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Folha de Pagamento</span>
            <h3 className="stat-value">R$ {metrics.folha.toFixed(2).replace('.', ',')}</h3>
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
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Salário</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {colaboradores.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div className="client-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div className="avatar bg-red-light" style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.15)' }}>
                          <UsersIcon size={16} color="var(--c-red)" />
                        </div>
                        <strong style={{ display: 'block' }}>{c.nome}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{c.cargo}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>R$ {Number(c.salario).toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`vini-badge ${c.status === 'ativo' ? 'success' : 'warning'}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                       <button onClick={() => handleExcluir(c.id)} className="vini-btn-action secondary"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
                {!loading && colaboradores.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Nenhum colaborador cadastrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resumo de Avisos (Estático por enquanto, focado em UX) */}
        <div className="side-panel">
          <div className="resumo-caixa vini-glass-panel" style={{ padding: '1.5rem', background: 'var(--bg-surface-elevated)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Documentos Pendentes</h3>
            <div className="resumo-stats" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
               <div className="resumo-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <FileCheck size={18} color="var(--c-yellow)" />
                    <span style={{ fontWeight: '500' }}>ASO Periódico</span>
                  </div>
                  <span className="vini-badge warning">1 Expirando</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE CADASTRO */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="vini-glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h3>Cadastrar Novo Colaborador</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              <input type="text" placeholder="Nome Completo" className="vini-input-dark" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="Cargo" className="vini-input-dark" style={{ flex: 1 }} required value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} />
                <input type="number" placeholder="Salário base" className="vini-input-dark" style={{ flex: 1 }} required value={formData.salario} onChange={e => setFormData({...formData, salario: e.target.value})} />
              </div>
              <input type="date" className="vini-input-dark" required value={formData.data_admissao} onChange={e => setFormData({...formData, data_admissao: e.target.value})} />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="vini-btn-outline" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="vini-btn-primary" style={{ flex: 1 }}>Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RH;
