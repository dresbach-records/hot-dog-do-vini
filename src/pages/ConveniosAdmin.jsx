import React, { useState } from 'react';
import { 
  Building2, User, Check, X, Clock, Plus, Search, 
  DollarSign, Briefcase, FileText, AlertCircle, TrendingUp
} from 'lucide-react';
import { useClientes } from '../context/ClientesContext';
import api from '../services/api';
import '../styles/admin/convenios.css';

function ConveniosAdmin() {
  const { clientes, empresas, solicitacoes, gerenciarSolicitacao, atualizarCliente, loading } = useClientes();
  const [activeTab, setActiveTab] = useState('solicitacoes'); // 'solicitacoes' | 'empresas' | 'financeiro'
  const [searchTerm, setSearchTerm] = useState('');
  const [asaasBalance, setAsaasBalance] = useState({ balance: 0 });
  const [isSyncing, setIsSyncing] = useState(false);

  // Helper para ocultar nomes específicos conforme pedido do usuário
  const sanitizeName = (name) => {
    if (!name) return 'N/A';
    const lower = name.toLowerCase();
    if (lower.includes('jose')) return 'Gestor Operacional';
    if (lower.includes('davi')) return 'Gestor Financeiro';
    return name;
  };

  React.useEffect(() => {
     const fetchBalance = async () => {
        try {
           const res = await api.get('/payments/balance');
           if (res.success) setAsaasBalance(res.balance);
        } catch (err) { console.error('Erro balance:', err); }
     };

     if (activeTab === 'financeiro') {
        fetchBalance();
        const interval = setInterval(fetchBalance, 30000); // 30s refresh
        return () => clearInterval(interval);
     }
  }, [activeTab]);

  const handleSyncCustomers = async () => {
     setIsSyncing(true);
     try {
        const res = await api.post('/payments/sync-customers');
        alert(`Sincronização concluída! Atualizados: ${res.results.updated}, Erros: ${res.results.errors}`);
        window.location.reload();
     } catch (err) {
        alert('Erro na sincronização: ' + err.message);
     } finally {
        setIsSyncing(false);
     }
  };

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
                        <span style={{ fontWeight: '600', display: 'block' }}>{sanitizeName(sol.dados_funcionario?.nome || cliente?.nome)}</span>
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

  const renderFinanceiro = () => (
    <div className="table-responsive">
      <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
         <button 
           className="vini-btn success" 
           onClick={handleSyncCustomers} 
           disabled={isSyncing}
           style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
         >
            <TrendingUp size={16} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar com Asaas'}
         </button>
      </div>
      <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg-active)', borderBottom: '1px solid var(--border-color)' }}>
            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Cliente</th>
            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Status Asaas</th>
            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Limite Indiv.</th>
            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Conta Responsável</th>
            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Ações Asaas</th>
          </tr>
        </thead>
        <tbody>
          {clientes
            .filter(c => c.convenio_status === 'ativo' || true)
            .map((c, i) => {
              const responsavel = clientes.find(r => r.id === c.linked_account_id);
              
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '600' }}>{sanitizeName(c.nome)}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Saldo atual: R$ {Number(c.saldo_devedor || 0).toFixed(2)}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`vini-badge ${c.asaas_customer_id ? 'success' : 'warning'}`}>
                       {c.asaas_customer_id ? 'Sincronizado' : 'Não Sincronizado'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <input 
                      type="number" 
                      defaultValue={c.individual_limit} 
                      onBlur={async (e) => {
                        const val = e.target.value ? parseFloat(e.target.value) : null;
                        await atualizarCliente(c.id, { individual_limit: val });
                      }}
                      style={{ width: '80px', padding: '5px', borderRadius: '4px', border: '1px solid #ddd', background: 'transparent', color: '#fff' }}
                      placeholder="Sem limite"
                    />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <select 
                      defaultValue={c.linked_account_id || ''}
                      onChange={async (e) => {
                        const val = e.target.value || null;
                        await atualizarCliente(c.id, { linked_account_id: val });
                      }}
                      style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd', background: 'rgba(255,255,255,0.05)', color: '#fff' }}
                    >
                      <option value="">Ninguém (Solo)</option>
                      {clientes.filter(r => r.id !== c.id).map(r => (
                        <option key={r.id} value={r.id}>{sanitizeName(r.nome)}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                       <button 
                         className="vini-btn-action success" 
                         title="Emitir Boleto"
                         onClick={async () => {
                            if (!window.confirm(`Deseja emitir um boleto via Asaas para ${c.nome}?`)) return;
                            try {
                               const res = await api.post('/payments/issue-asaas', {
                                  userId: c.id,
                                  total: c.saldo_devedor,
                                  metodo: 'BOLETO',
                                  descricao: 'Fatura Mensal Vini Delivery'
                               });
                               alert('Boleto gerado com sucesso! Link: ' + res.payment.invoiceUrl);
                               window.open(res.payment.invoiceUrl, '_blank');
                            } catch (err) {
                               alert('Erro: ' + err.message);
                            }
                         }}
                       >
                          <FileText size={16} />
                       </button>
                       <button 
                         className="vini-btn-action danger" 
                         title="Negativar (Serasa)"
                         onClick={async () => {
                            const pid = window.prompt("Digite o ID da Cobrança Asaas para negativar:");
                            if (!pid) return;
                            try {
                               await api.post('/payments/negativar', { paymentId: pid });
                               alert('Solicitação de negativação enviada ao Asaas.');
                            } catch (err) {
                               alert('Erro: ' + err.message);
                            }
                         }}
                       >
                          <AlertCircle size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Gestão de Saldo Compartilhado</h2>
          <p>Módulo de controle de delegados e gestão de benefícios.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="stats-mini-list" style={{ display: 'flex', gap: '1.5rem', marginRight: '2rem' }}>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Faturamento Interno</div>
                  <div style={{ fontWeight: '800', color: 'var(--c-green)', fontSize: '1.1rem' }}>R$ {clientes.reduce((acc, c) => acc + Number(c.total_cliente || 0), 0).toFixed(2)}</div>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Saldo Carteira Asaas</div>
                  <div style={{ fontWeight: '800', color: 'var(--c-blue)', fontSize: '1.1rem' }}>R$ {Number(asaasBalance.balance || 0).toFixed(2)}</div>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dívida em Aberto</div>
                  <div style={{ fontWeight: '800', color: 'var(--c-red)', fontSize: '1.1rem' }}>R$ {clientes.reduce((acc, c) => acc + Number(c.saldo_devedor || 0), 0).toFixed(2)}</div>
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
           <button 
             onClick={() => setActiveTab('financeiro')}
             style={{ 
                background: 'none', border: 'none', borderBottom: activeTab === 'financeiro' ? '3px solid var(--c-blue)' : '3px solid transparent',
                padding: '0.5rem 1rem', fontWeight: '700', fontSize: '1rem', color: activeTab === 'financeiro' ? 'var(--c-blue)' : 'var(--text-muted)', cursor: 'pointer'
             }}
           >
             Financeiro (Asaas)
           </button>
        </div>

        {activeTab === 'solicitacoes' ? (
           <div className="vini-glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              {renderSolicitacoes()}
           </div>
        ) : activeTab === 'empresas' ? (
           renderEmpresas()
        ) : (
           <div className="vini-glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              {renderFinanceiro()}
           </div>
        )}
      </div>
    </div>
  );
}

export default ConveniosAdmin;
