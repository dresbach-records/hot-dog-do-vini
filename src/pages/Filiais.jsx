import React, { useState, useEffect } from 'react';
import { Store, Plus, MapPin, User, TrendingUp, MoreVertical, Trash2, Edit } from 'lucide-react';
import api from '../services/api';
import '../styles/admin/dashboard.css';

function Filiais() {
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novaFilial, setNovaFilial] = useState({ nome: '', endereco: '', responsavel: '', meta: 0 });

  useEffect(() => {
    fetchFiliais();
  }, []);

  const fetchFiliais = async () => {
    setLoading(true);
    try {
      const res = await api.get('/filiais');
      if (res.success) setFiliais(res.data);
    } catch (error) {
      console.error('Erro ao buscar filiais:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/filiais', novaFilial);
      if (res.success) {
        setIsModalOpen(false);
        setNovaFilial({ nome: '', endereco: '', responsavel: '', meta: 0 });
        fetchFiliais();
      }
    } catch (error) {
      alert('Erro ao criar filial');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Excluir esta unidade permanentemente?')) {
      try {
        const res = await api.delete(`/filiais/${id}`);
        if (res.success) fetchFiliais();
      } catch (error) {
        alert('Erro ao excluir');
      }
    }
  };

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '2rem' }}>
      <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Gestão de Filiais</h2>
          <p className="text-secondary">Gerencie suas unidades físicas, metas e performance centralizada.</p>
        </div>
        <button className="vini-btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Nova Unidade
        </button>
      </header>

          <div className="stat-icon-wrapper bg-blue-light">
            <Building2 size={24} color="var(--c-blue)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Unidades Físicas</span>
            <h3 className="stat-value">2</h3>
            <span className="stat-trend positive">Expansão de 0% em 2024</span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-green-light">
            <TrendingUp size={24} color="var(--c-green)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Faturamento Global</span>
            <h3 className="stat-value text-positive">R$ 68.500,00</h3>
            <span className="stat-trend positive">+4% acima da meta combinada</span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-yellow-light">
            <AlertTriangle size={24} color="var(--c-yellow)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Problemas na Operação</span>
            <h3 className="stat-value text-negative">1</h3>
            <span className="stat-trend negative">Falta de insumo (Filial Sul)</span>
          </div>
        </div>
      </div>

      <div className="caixa-content">
        <div className="vini-glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="section-header" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Unidades Vini's</h3>
            <button className="vini-btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>+ Nova Unidade</button>
          </div>
          <div className="table-responsive">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-active)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Nome da Filial</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Responsável</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Meta Atual</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Performance</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div className="client-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div className="avatar bg-red-light" style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.15)' }}>
                        <Store size={18} color="var(--c-red)" />
                      </div>
                      <span style={{ fontWeight: '600' }}>Filial Centro (Matriz)</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>Vini / Ana</td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>R$ 40.000,00</td>
                  <td style={{ padding: '1rem' }}><span className="text-positive" style={{ fontWeight: '600', color: 'var(--c-green)' }}>+8% acima</span></td>
                  <td style={{ padding: '1rem' }}><span className="vini-badge-success">Operando</span></td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem' }}>
                    <div className="client-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div className="avatar bg-yellow-light" style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245, 158, 11, 0.15)' }}>
                        <Store size={18} color="var(--c-yellow)" />
                      </div>
                      <span style={{ fontWeight: '600' }}>Filial Sul (Shopping)</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>Carlos</td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>R$ 25.000,00</td>
                  <td style={{ padding: '1rem' }}><span className="text-negative" style={{ fontWeight: '600', color: 'var(--c-red)' }}>-2% abaixo</span></td>
                  <td style={{ padding: '1rem' }}><span className="vini-badge-warning" style={{ color: 'var(--c-yellow)', background: 'rgba(245, 158, 11, 0.15)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>Atenção</span></td>
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
