import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  TrendingUp, TrendingDown, Clock, CheckCircle2, 
  XCircle, Filter, DollarSign, Calendar, Eye
} from 'lucide-react';
import { useCaixa } from '../context/CaixaContext';
import '../styles/admin/caixa.css';

function Caixa() {
  const { sessaoAtiva, fecharCaixa } = useCaixa();
  const [sessoes, setSessoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessao, setSelectedSessao] = useState(null);

  useEffect(() => {
    fetchSessoes();
  }, [sessaoAtiva]);

  const fetchSessoes = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/caixa/sessoes');
      if (resp.success) setSessoes(resp.data || []);
    } catch (err) {
      console.error('Erro ao carregar histórico de caixa:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFecharCaixa = async (sessionId) => {
    const valor = window.prompt('Informe o valor total em dinheiro no caixa para conferência:');
    if (valor === null) return;

    const res = await fecharCaixa(sessionId, parseFloat(valor.replace(',', '.')));
    if (res.success) {
      alert('Caixa fechado com sucesso!');
      fetchSessoes();
    } else {
      alert('Erro: ' + res.error);
    }
  };

  const getResumoSessao = async (id) => {
    try {
      const res = await api.get(`/caixa/${id}/resumo`);
      if (res.success) setSelectedSessao(res.data);
    } catch (err) {
      alert('Erro ao carregar resumo da sessão');
    }
  };

  return (
    <div className="dashboard-page animate-fade-in caixa-page" style={{ padding: '2rem' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>Gestão de Caixa Operacional</h2>
          <p className="text-secondary">Histórico de turnos, fechamentos e conferência de valores.</p>
        </div>
      </header>

      {/* STATUS DO CAIXA ATUAL */}
      <div 
        className="vini-glass-panel" 
        style={{ 
          marginBottom: '2rem', padding: '2rem', 
          background: sessaoAtiva ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
          border: sessaoAtiva ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '50%', background: sessaoAtiva ? '#22c55e' : '#ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
             {sessaoAtiva ? <CheckCircle2 color="#fff" size={30} /> : <XCircle color="#fff" size={30} />}
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Terminal {sessaoAtiva ? 'Operacional' : 'Fechado'}</h3>
            <p style={{ opacity: 0.6, margin: '4px 0 0 0' }}>
              {sessaoAtiva 
                ? `Iniciado em ${new Date(sessaoAtiva.aberto_em).toLocaleString()} por ${sessaoAtiva.usuario_abertura}`
                : 'Abra um novo turno no PDV para iniciar as vendas.'}
            </p>
          </div>
        </div>
        {sessaoAtiva && (
          <button className="vini-btn-primary" onClick={() => handleFecharCaixa(sessaoAtiva.id)}>
             Encerrar Turno e Conferir
          </button>
        )}
      </div>

      {/* TABELA DE HISTÓRICO */}
      <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
           <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
             <Clock size={20} /> Histórico de Sessões
           </h3>
           <button className="vini-btn-outline"><Filter size={16} /> Filtrar</button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Turno</th>
                <th>Responsável</th>
                <th>Abertura</th>
                <th>Fechamento</th>
                <th>Status</th>
                <th>Saldo Final</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {sessoes.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: '700' }}>#{s.id.substring(0, 8)}</td>
                  <td>{s.usuario_abertura}</td>
                  <td>{new Date(s.aberto_em).toLocaleString()}</td>
                  <td>{s.fechado_em ? new Date(s.fechado_em).toLocaleString() : '-'}</td>
                  <td>
                    <span className={`vini-badge ${s.status === 'aberto' ? 'success' : 'secondary'}`}>
                       {s.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontWeight: '800', color: '#22c55e' }}>
                    R$ {Number(s.valor_total_vendas || 0).toFixed(2)}
                  </td>
                  <td>
                    <button className="vini-btn-outline" style={{ padding: '6px' }} title="Ver Detalhes" onClick={() => getResumoSessao(s.id)}>
                       <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sessoes.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>Carregando histórico...</div>}
        </div>
      </div>

      {/* MODAL DETALHES (OPCIONAL/POSTERIOR) */}
      {selectedSessao && (
        <div className="vini-modal-overlay" onClick={() => setSelectedSessao(null)}>
           <div className="vini-modal-content" style={{ maxWidth: '500px', padding: '2rem' }} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: '1.5rem' }}>Resumo da Sessão #{selectedSessao.id.substring(0,8)}</h2>
              <div style={{ display: 'grid', gap: '1rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Fundo Inicial:</span>
                    <strong>R$ {Number(selectedSessao.valor_abertura).toFixed(2)}</strong>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', color: '#22c55e' }}>
                    <span>Total Vendas:</span>
                    <strong>R$ {Number(selectedSessao.valor_total_vendas).toFixed(2)}</strong>
                 </div>
                 <hr style={{ opacity: 0.1 }} />
                 {selectedSessao.por_metodo && Object.entries(selectedSessao.por_metodo).map(([metodo, valor]) => (
                    <div key={metodo} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', opacity: 0.8 }}>
                       <span style={{ textTransform: 'uppercase' }}>{metodo}:</span>
                       <span>R$ {Number(valor).toFixed(2)}</span>
                    </div>
                 ))}
              </div>
              <button 
                className="vini-btn-primary" 
                style={{ width: '100%', marginTop: '2rem' }}
                onClick={() => setSelectedSessao(null)}
              >
                Fechar Resumo
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

export default Caixa;
