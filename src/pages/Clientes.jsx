import React, { useState, useMemo } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  DollarSign, 
  Activity, 
  Settings, 
  Search, 
  Filter, 
  X, 
  Save, 
  Clock, 
  CreditCard, 
  Wallet,
  AlertCircle,
  Trash2,
  FileUp,
  Database
} from 'lucide-react';
import { useClientes } from '../context/ClientesContext';
import { toast } from 'react-hot-toast';
import '../styles/admin/dashboard.css';

function Clientes() {
  const { clientes, resumo, adicionarCliente, atualizarCliente, excluirCliente, marcarComoPago, fetchData } = useClientes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDebtors, setFilterDebtors] = useState(false);
  
  // Modal States
  const [editingClient, setEditingClient] = useState(null);
  const [viewingHistory, setViewingHistory] = useState(null);
  const [isReceivingPayment, setIsReceivingPayment] = useState(null);
  const [isManualImportOpen, setIsManualImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importPreview, setImportPreview] = useState([]);

  // Form States for Edit
  const [editForm, setEditForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    saldo_devedor: 0,
    memo: ''
  });

  // Form States for Payment
  const [payForm, setPayForm] = useState({
    valor: 0,
    metodo: 'PIX',
    memo: ''
  });

  const filteredClientes = useMemo(() => {
    let result = clientes || [];
    
    if (filterDebtors) {
      result = result.filter(c => Number(c.saldo_devedor) > 0);
    }
    
    if (searchTerm) {
      result = result.filter(c => 
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telefone?.includes(searchTerm)
      );
    }
    
    return result;
  }, [clientes, filterDebtors, searchTerm]);

  const handleEditClick = (cliente) => {
    setEditForm({
      nome: cliente.nome || '',
      telefone: cliente.telefone || '',
      email: cliente.email || '',
      saldo_devedor: Number(cliente.saldo_devedor) || 0,
      memo: ''
    });
    setEditingClient(cliente);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await atualizarCliente(editingClient.id, {
        nome: editForm.nome,
        telefone: editForm.telefone,
        email: editForm.email,
        saldo_devedor: Number(editForm.saldo_devedor),
        memo: editForm.memo || 'Ajuste manual de dados/saldo'
      });
      
      if (res.success) {
        toast.success('Cliente atualizado com sucesso!');
        setEditingClient(null);
        fetchData();
      } else {
        toast.error(`Erro: ${res.error || 'Não foi possível salvar'}`);
      }
    } catch (err) {
      toast.error('Falha na comunicação com o servidor');
    }
  };

  const handleDeleteClient = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${nome}? Todos os registros, pedidos e transações serão removidos.`)) {
      try {
        const res = await excluirCliente(id);
        if (res.success) {
          toast.success('Cliente removido com sucesso!');
          fetchData();
        } else {
          toast.error(res.error || 'Erro ao remover cliente');
        }
      } catch (err) {
        toast.error('Erro na comunicação');
      }
    }
  };

  const handleReceivePayment = async () => {
    if (payForm.valor <= 0) return toast.error('Valor deve ser maior que zero');
    
    try {
      const cliente = isReceivingPayment;
      const novoSaldo = Math.max(0, Number(cliente.saldo_devedor) - Number(payForm.valor));
      const novoTotalPago = Number(cliente.total_pago || 0) + Number(payForm.valor);

      const res = await atualizarCliente(cliente.id, {
        saldo_devedor: novoSaldo,
        total_pago: novoTotalPago,
        memo: `Pagamento recebido via ${payForm.metodo}. ${payForm.memo}`
      });

      if (res.success) {
        toast.success(`Pagamento de R$ ${payForm.valor} registrado!`);
        setIsReceivingPayment(null);
        fetchData();
      } else {
        toast.error('Erro ao registrar pagamento');
      }
    } catch (err) {
      toast.error('Erro no servidor');
    }
  };

  const handleParseImport = () => {
    if (!importText.trim()) return;
    
    const lines = importText.split('\n').filter(l => l.trim());
    const results = [];

    lines.forEach(line => {
      const segments = line.split(/(?<=\bpago\b)/i);
      
      segments.forEach(seg => {
        let s = seg.trim();
        if (!s) return;
        
        let saldo = 0;
        const valMatch = s.match(/R\$\s*(\d+[,.]\d+)/i);
        if (valMatch) {
          const cleanVal = valMatch[1].replace(',', '.');
          saldo = parseFloat(cleanVal);
        }
        
        let isPago = s.toLowerCase().includes('pago');
        let nome = s.split(/→|R\$|pago/i)[0].trim().replace(/^,/, '').trim();
        
        if (nome && nome.length > 1) {
          results.push({
            nome,
            saldo: isPago ? 0 : saldo,
            status: isPago ? 'PAGO' : 'EM DÍVIDA',
            selected: true
          });
        }
      });
    });
    
    setImportPreview(results);
  };

  const handleConfirmImport = async () => {
    const clientsToImport = importPreview.filter(p => p.selected);
    if (clientsToImport.length === 0) return toast.error('Selecione ao menos um cliente');

    const toastId = toast.loading(`Importando ${clientsToImport.length} clientes...`);
    let successCount = 0;
    
    try {
      for (const item of clientsToImport) {
        const existing = (clientes || []).find(c => c.nome.toLowerCase() === item.nome.toLowerCase());
        
        if (existing) {
          await atualizarCliente(existing.id, {
            saldo_devedor: item.saldo,
            memo: 'Carga manual em massa'
          });
        } else {
          await adicionarCliente({ 
            nome: item.nome, 
            saldo_devedor: item.saldo,
            memo: 'Primeira carga manual'
          });
        }
        successCount++;
      }
      
      toast.success(`${successCount} clientes processados!`, { id: toastId });
      setIsManualImportOpen(false);
      setImportText('');
      setImportPreview([]);
      fetchData();
    } catch (err) {
      toast.error('Erro na importação em massa', { id: toastId });
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Gestão de Clientes & Inadimplência</h2>
          <p>Controle de quem deve, quem pagou e histórico financeiro detalhado.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <div className="search-box" style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Buscar por nome ou contato..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', width: '300px' }}
              />
           </div>
            <button 
              className={`btn ${filterDebtors ? 'vini-btn-primary' : 'vini-btn-secondary'}`}
              onClick={() => setFilterDebtors(!filterDebtors)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Filter size={16} /> {filterDebtors ? 'Mostrando Devedores' : 'Filtrar Devedores'}
            </button>
            <button 
              className="btn vini-btn-primary"
              onClick={() => setIsManualImportOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--c-blue)', borderColor: 'var(--c-blue)' }}
            >
              <FileUp size={16} /> Carga Manual
            </button>
         </div>
      </header>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="vini-glass-panel vini-card-stat">
          <div className="stat-icon-wrapper blue"><User size={24} /></div>
          <div>
            <span className="stat-label">Total de Clientes</span>
            <div className="stat-value">{resumo.total_clientes || 0}</div>
            <span className="stat-trend neutral">Cadastrados no sistema</span>
          </div>
        </div>
        <div className="vini-glass-panel vini-card-stat">
          <div className="stat-icon-wrapper green"><Activity size={24} /></div>
          <div>
            <span className="stat-label">Clientes Ativos</span>
            <div className="stat-value">{resumo.total_ativos || 0}</div>
            <span className="stat-trend positive">Pagaram / Em dia</span>
          </div>
        </div>
        <div className="vini-glass-panel vini-card-stat">
          <div className="stat-icon-wrapper red"><AlertCircle size={24} /></div>
          <div>
            <span className="stat-label">Em Dívida</span>
            <div className="stat-value">{resumo.total_devedores || 0}</div>
            <span className="stat-trend negative">Inadimplentes</span>
          </div>
        </div>
        <div className="vini-glass-panel vini-card-stat">
          <div className="stat-icon-wrapper yellow"><DollarSign size={24} /></div>
          <div>
            <span className="stat-label">Total Pendente</span>
            <div className="stat-value">R$ {Number(resumo.total_em_aberto_estimado || 0).toFixed(2).replace('.', ',')}</div>
            <span className="stat-trend neutral">Valor a receber</span>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content" style={{ display: 'block' }}>
        <div className="vini-glass-panel" style={{ overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-active)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1.25rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Cliente</th>
                  <th style={{ padding: '1.25rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Contato</th>
                  <th style={{ padding: '1.25rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status Financeiro</th>
                  <th style={{ padding: '1.25rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Total Acumulado</th>
                  <th style={{ padding: '1.25rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.map((cliente, i) => {
                  const saldoFormatado = Number(cliente.saldo_devedor || 0).toFixed(2).replace('.', ',');
                  const totalGasto = Number(cliente.total_cliente || 0).toFixed(2).replace('.', ',');
                  const isDevedor = Number(cliente.saldo_devedor) > 0;

                  return (
                    <tr key={cliente.id || i} style={{ borderBottom: '1px solid var(--border-color)', transition: 'all 0.2s' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div className={`avatar ${isDevedor ? 'bg-red-light' : 'bg-green-light'}`} style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} color={isDevedor ? '#ef4444' : '#22c55e'} />
                          </div>
                          <div>
                            <span style={{ fontWeight: '600', display: 'block' }}>{cliente.nome}</span>
                            <span 
                              className={!cliente.email ? 'clickable-na' : ''}
                              onClick={() => !cliente.email && handleEditClick(cliente)}
                              style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                            >
                              {cliente.email || 'sem email (clique p/ inserir)'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div 
                          className={!cliente.telefone ? 'clickable-na' : ''}
                          onClick={() => !cliente.telefone && handleEditClick(cliente)}
                          style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}
                        >
                          <Phone size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                          {cliente.telefone || 'N/A (clique p/ inserir)'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {isDevedor ? (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', width: 'fit-content' }}>⏳ EM DÍVIDA</span>
                            <span style={{ fontSize: '0.9rem', color: '#ef4444', fontWeight: '800', marginTop: '4px' }}>R$ {saldoFormatado}</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', width: 'fit-content' }}>✅ PAGO</span>
                            <span style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '4px' }}>Sem pendências</span>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
                          <DollarSign size={14} color="var(--text-muted)" />
                          R$ {totalGasto}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {isDevedor && (
                            <button 
                              className="vini-btn-primary" 
                              title="Receber Pagamento"
                              onClick={() => {
                                setIsReceivingPayment(cliente);
                                setPayForm({ valor: Number(cliente.saldo_devedor), metodo: 'PIX', memo: '' });
                              }}
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                            >
                              <Wallet size={14} style={{ marginRight: '4px' }} /> Receber
                            </button>
                          )}
                          <button 
                            className="vini-btn-action secondary" 
                            title="Editar Dados e Saldo"
                            onClick={() => handleEditClick(cliente)}
                          >
                            <Settings size={16} />
                          </button>
                          <button 
                            className="vini-btn-action secondary" 
                            title="Ver Extrato de Transações"
                            onClick={() => setViewingHistory(cliente)}
                          >
                            <Clock size={16} />
                          </button>
                          <button 
                            className="vini-btn-action secondary danger" 
                            title="Excluir Cliente"
                            onClick={() => handleDeleteClient(cliente.id, cliente.nome)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingClient && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="vini-glass-panel animate-scale-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Settings /> Editar Cliente</h3>
              <button onClick={() => setEditingClient(null)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}><X /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#999', marginBottom: '4px' }}>Nome</label>
                <input type="text" className="vini-input" value={editForm.nome} onChange={e => setEditForm({...editForm, nome: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#999', marginBottom: '4px' }}>Telefone</label>
                  <input type="text" className="vini-input" value={editForm.telefone} onChange={e => setEditForm({...editForm, telefone: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#999', marginBottom: '4px' }}>E-mail</label>
                  <input type="email" className="vini-input" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                </div>
              </div>
              <div className="form-group" style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px dashed rgba(239, 68, 68, 0.3)' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#ef4444', marginBottom: '4px', fontWeight: 'bold' }}>Saldo Devedor (Manual)</label>
                <div style={{ position: 'relative' }}>
                   <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#ef4444', fontWeight: 'bold' }}>R$</span>
                   <input type="number" className="vini-input" value={editForm.saldo_devedor} onChange={e => setEditForm({...editForm, saldo_devedor: e.target.value})} style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontWeight: 'bold' }} />
                </div>
                <p style={{ fontSize: '0.7rem', color: '#999', marginTop: '8px' }}>⚠️ Alterar este valor gerará uma transação automática de ajuste.</p>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#999', marginBottom: '4px' }}>Motivo da Alteração</label>
                <textarea placeholder="Ex: Correção de erro no pedido, cliente pagou por fora..." value={editForm.memo} onChange={e => setEditForm({...editForm, memo: e.target.value})} style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid #333', borderRadius: '8px', color: '#fff', minHeight: '80px', resize: 'none' }} />
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button onClick={handleSaveEdit} className="vini-btn-primary" style={{ flex: 1, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><Save size={18} /> Salvar Alterações</button>
              <button onClick={() => setEditingClient(null)} className="vini-btn-secondary" style={{ padding: '1rem' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIVE PAYMENT MODAL */}
      {isReceivingPayment && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="vini-glass-panel animate-scale-in" style={{ width: '100%', maxWidth: '450px', padding: '2rem', border: '1px solid var(--c-green)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '60px', height: '60px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <DollarSign size={32} />
              </div>
              <h3 style={{ margin: 0 }}>Receber de {isReceivingPayment.nome}</h3>
              <p style={{ color: '#999', fontSize: '0.85rem' }}>Total pendente: R$ {Number(isReceivingPayment.saldo_devedor).toFixed(2).replace('.', ',')}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
               <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#999', marginBottom: '6px' }}>Quanto o cliente pagou?</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 'bold' }}>R$</span>
                    <input 
                      type="number" 
                      value={payForm.valor} 
                      onChange={e => setPayForm({...payForm, valor: e.target.value})}
                      style={{ width: '100%', padding: '1rem 1rem 1rem 2.5rem', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}
                    />
                  </div>
               </div>

               <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#999', marginBottom: '6px' }}>Método de Pagamento</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                     {['PIX', 'DINHEIRO', 'CARTÃO'].map(m => (
                       <button 
                         key={m} 
                         onClick={() => setPayForm({...payForm, metodo: m})}
                         style={{ 
                           padding: '10px', 
                           borderRadius: '8px', 
                           border: payForm.metodo === m ? '2px solid #22c55e' : '1px solid #e2e8f0',
                           background: payForm.metodo === m ? 'rgba(34, 197, 94, 0.1)' : '#fff',
                           color: payForm.metodo === m ? '#15803d' : '#64748b',
                           fontWeight: 'bold',
                           cursor: 'pointer'
                         }}
                       >
                         {m}
                       </button>
                     ))}
                  </div>
               </div>

               <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#999', marginBottom: '6px' }}>Observação (Opcional)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Pagou metade hoje..." 
                    value={payForm.memo} 
                    onChange={e => setPayForm({...payForm, memo: e.target.value})} 
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
               </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', gap: '10px' }}>
              <button onClick={handleReceivePayment} className="vini-btn-primary" style={{ flex: 1, padding: '1rem', background: '#22c55e', borderColor: '#22c55e' }}>Confirmar Recebimento</button>
              <button onClick={() => setIsReceivingPayment(null)} className="vini-btn-secondary" style={{ padding: '1rem' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {viewingHistory && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="vini-glass-panel animate-scale-in" style={{ width: '100%', maxWidth: '750px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Clock /> Extrato Financeiro</h3>
                <p style={{ margin: '4px 0 0', color: '#999', fontSize: '0.85rem' }}>Histórico completo para {viewingHistory.nome}</p>
              </div>
              <button onClick={() => setViewingHistory(null)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
               {!viewingHistory.transacoes || viewingHistory.transacoes.length === 0 ? (
                 <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <AlertCircle size={48} style={{ margin: '0 auto 15px', opacity: 0.3 }} />
                    <p>Nenhuma transação registrada para este cliente ainda.</p>
                 </div>
               ) : (
                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead>
                     <tr style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #333' }}>
                       <th style={{ textAlign: 'left', padding: '10px' }}>Data</th>
                       <th style={{ textAlign: 'left', padding: '10px' }}>Tipo</th>
                       <th style={{ textAlign: 'left', padding: '10px' }}>Descrição / "O Que / Como"</th>
                       <th style={{ textAlign: 'right', padding: '10px' }}>Valor</th>
                     </tr>
                   </thead>
                   <tbody>
                     {viewingHistory.transacoes.map((t, idx) => (
                       <tr key={idx} style={{ borderBottom: '1px solid #222', fontSize: '0.9rem' }}>
                         <td style={{ padding: '12px 10px', color: '#999' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                         <td style={{ padding: '12px 10px' }}>
                            <span style={{ 
                              padding: '2px 8px', 
                              borderRadius: '4px', 
                              fontSize: '0.7rem', 
                              fontWeight: 'bold',
                              background: t.tipo === 'credito' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: t.tipo === 'credito' ? '#22c55e' : '#ef4444'
                            }}>
                              {t.tipo === 'credito' ? 'PAGO' : 'DÉBITO'}
                            </span>
                         </td>
                         <td style={{ padding: '12px 10px', color: '#e2e8f0' }}>{t.descricao}</td>
                         <td style={{ padding: '12px 10px', textAlign: 'right', fontWeight: 'bold', color: t.tipo === 'credito' ? '#22c55e' : '#ef4444' }}>
                           {t.tipo === 'credito' ? '+' : '-'} R$ {Number(t.valor).toFixed(2).replace('.', ',')}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               )}
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#999' }}>TOTAL GASTO</div>
                    <div style={{ fontWeight: 'bold' }}>R$ {Number(viewingHistory.total_cliente || 0).toFixed(2).replace('.', ',')}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#999' }}>TOTAL PAGO</div>
                    <div style={{ fontWeight: 'bold', color: '#22c55e' }}>R$ {Number(viewingHistory.total_pago || 0).toFixed(2).replace('.', ',')}</div>
                  </div>
               </div>
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 'bold' }}>SALDO DEVEDOR ATUAL</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ef4444' }}>R$ {Number(viewingHistory.saldo_devedor || 0).toFixed(2).replace('.', ',')}</div>
               </div>
            </div>
          </div>
        </div>
      )}
      {/* MANUAL IMPORT MODAL */}
      {isManualImportOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="vini-glass-panel animate-scale-in" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><FileUp /> Carga Manual em Massa</h3>
                <p style={{ margin: '4px 0 0', color: '#999', fontSize: '0.85rem' }}>Cole a lista de clientes para processamento automático.</p>
              </div>
              <button onClick={() => setIsManualImportOpen(false)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              {importPreview.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Exemplo de formato aceito:<br />
                    <code>Nome do Cliente pago</code><br />
                    <code>Nome do Cliente → R$ 25,00</code>
                  </p>
                  <textarea 
                    placeholder="Cole sua lista aqui..." 
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    style={{ width: '100%', minHeight: '300px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', borderRadius: '12px', padding: '1rem', color: '#fff', fontSize: '0.9rem', fontFamily: 'monospace' }}
                  />
                  <button onClick={handleParseImport} className="vini-btn-primary" style={{ padding: '1rem' }}>
                    Processar Lista
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="table-responsive" style={{ border: '1px solid #333', borderRadius: '12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <tr>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem' }}></th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem' }}>Cliente</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem' }}>Saldo</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '0.8rem' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((item, idx) => (
                          <tr key={idx} style={{ borderTop: '1px solid #222' }}>
                            <td style={{ padding: '10px' }}>
                              <input 
                                type="checkbox" 
                                checked={item.selected} 
                                onChange={(e) => {
                                  const newList = [...importPreview];
                                  newList[idx].selected = e.target.checked;
                                  setImportPreview(newList);
                                }}
                              />
                            </td>
                            <td style={{ padding: '10px' }}>
                              <input 
                                type="text" 
                                value={item.nome} 
                                onChange={(e) => {
                                  const newList = [...importPreview];
                                  newList[idx].nome = e.target.value;
                                  setImportPreview(newList);
                                }}
                                style={{ background: 'none', border: 'none', borderBottom: '1px solid transparent', color: '#fff', width: '100%' }}
                              />
                            </td>
                            <td style={{ padding: '10px' }}>
                              <input 
                                type="number" 
                                value={item.saldo} 
                                onChange={(e) => {
                                  const newList = [...importPreview];
                                  newList[idx].saldo = Number(e.target.value);
                                  setImportPreview(newList);
                                }}
                                style={{ background: 'none', border: 'none', borderBottom: '1px solid transparent', color: item.saldo > 0 ? '#ef4444' : '#22c55e', width: '80px', fontWeight: 'bold' }}
                              />
                            </td>
                            <td style={{ padding: '10px' }}>
                              <span style={{ fontSize: '0.7rem', color: item.status === 'PAGO' ? '#22c55e' : '#ef4444' }}>{item.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleConfirmImport} className="vini-btn-primary" style={{ flex: 1, padding: '1rem' }}>
                      Confirmar Importação de {importPreview.filter(p => p.selected).length} itens
                    </button>
                    <button onClick={() => setImportPreview([])} className="vini-btn-secondary" style={{ padding: '1rem' }}>
                      Voltar e Corrigir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clientes;
