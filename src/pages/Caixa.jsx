import React, { useState } from 'react';
import { Search, Plus, User, FileText, Edit, X, Save } from 'lucide-react';
import { useClientes } from '../context/ClientesContext';
import '../assets/styles/Caixa.css';

function Caixa() {
  const { clientes, pagamentosConfirmados, atualizarCliente } = useClientes();
  // Filtramos os clientes que possuem saldo devedor/status pendente para exibir como "Fiados" 
  // (ou exibimos todos se for um PDV geral).
  const clientesFiados = clientes.filter(c => c.status === 'PENDENTE' || c.valor > 0 || c.saldo_devedor > 0);

  const [editingClient, setEditingClient] = useState(null);

  const handleEditClick = (cliente) => {
    setEditingClient({ ...cliente });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    atualizarCliente(editingClient.nome, editingClient);
    setEditingClient(null); // Fecha o modal após salvar
  };

  const handleModalChange = (field, value) => {
    setEditingClient({ ...editingClient, [field]: value });
  };

  return (
    <div className="dashboard-page animate-fade-in caixa-page" style={{ position: 'relative' }}>
      <header className="page-header">
        <div>
          <h2>PDV & Vendas Fiadas</h2>
          <p className="text-secondary">Gerenciamento de vendas diárias e controle de fiados.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Nova Venda
          </button>
        </div>
      </header>

      <div className="caixa-content">
        <div className="fiados-section glass-panel">
          <div className="section-header-row">
            <h3>Controle de Fiados</h3>
            <div className="search-bar">
              <Search size={16} color="var(--text-muted)" />
              <input type="text" placeholder="Buscar cliente..." />
            </div>
          </div>
          
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Telefone</th>
                  <th>Endereço</th>
                  <th>Valor Aberto</th>
                  <th>Última Compra</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiados.map((cliente, idx) => {
                  const valorExibicao = typeof cliente.valor === 'number' ? cliente.valor : (cliente.saldo_devedor || cliente.total_cliente || 0);

                  return (
                  <tr key={idx}>
                    <td>
                      <div className="client-cell">
                        <div className={`avatar ${cliente.status === 'Quitado' || cliente.status === 'PAGO' ? 'bg-dark-layer' : (valorExibicao > 100 ? 'bg-red-light' : 'bg-yellow-light')}`}>
                          <User size={14} color={cliente.status === 'Quitado' || cliente.status === 'PAGO' ? 'var(--text-muted)' : (valorExibicao > 100 ? 'var(--c-red)' : 'var(--c-yellow)')} />
                        </div>
                        <span>{cliente.nome}</span>
                      </div>
                    </td>
                    <td>{cliente.telefone || 'Sem Tel'}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{cliente.endereco || 'Endereço não def.'}</td>
                    <td className={`font-semibold ${valorExibicao > 0 ? 'text-negative' : 'text-secondary'}`}>
                      R$ {valorExibicao.toFixed(2).replace('.', ',')}
                    </td>
                    <td>{cliente.pedidos ? cliente.pedidos[0]?.data || 'Recente' : 'Recente'}</td>
                    <td>
                      <span className={`badge ${cliente.status === 'PENDENTE' ? 'warning' : 'success'}`}>
                        {cliente.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {valorExibicao > 0 ? (
                          <button className="btn-action">Receber</button>
                        ) : (
                          <button className="btn-action secondary"><FileText size={16} /></button>
                        )}
                        <button className="btn-action secondary" onClick={() => handleEditClick({ ...cliente, valor: valorExibicao })} title="Editar Cliente">
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>

        <div className="side-panel">
          <div className="resumo-caixa glass-panel">
            <h3>Resumo do Caixa (Hoje)</h3>
            <div className="resumo-stats">
              <div className="resumo-item">
                <span>Recebidos (Pagos Hoje)</span>
                <h4>R$ {clientes.filter(c => pagamentosConfirmados.includes(c.nome)).reduce((acc, curr) => acc + (curr.total_pago || curr.total_cliente || 0), 0).toFixed(2).replace('.', ',')}</h4>
              </div>
              <div className="resumo-item highlight">
                <span>A Receber (Fiado)</span>
                <h4 className="text-yellow">R$ {clientesFiados.reduce((acc, curr) => acc + (typeof curr.valor === 'number' ? curr.valor : (curr.saldo_devedor || curr.total_cliente || 0)), 0).toFixed(2).replace('.', ',')}</h4>
              </div>
              <div className="divider"></div>
              <div className="resumo-item total">
                <span>Total Bruto</span>
                <h4 className="text-green">R$ {(clientes.filter(c => pagamentosConfirmados.includes(c.nome)).reduce((acc, curr) => acc + (curr.total_pago || curr.total_cliente || 0), 0) + clientesFiados.reduce((acc, curr) => acc + (typeof curr.valor === 'number' ? curr.valor : (curr.saldo_devedor || curr.total_cliente || 0)), 0)).toFixed(2).replace('.', ',')}</h4>
              </div>
            </div>
            <button className="btn-outline">Fechar Caixa</button>
          </div>
        </div>
      </div>

      {editingClient && (
        <div className="modal-overlay" style={{ zIndex: 1000 }} onClick={() => setEditingClient(null)}>
          <div className="modal-content glass-panel" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit color="var(--c-blue)" size={20} />
                Editar Dados do Cliente
              </h3>
              <button className="modal-close" onClick={() => setEditingClient(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Nome do Cliente</label>
                  <input 
                    type="text" 
                    value={editingClient.nome} 
                    onChange={e => handleModalChange('nome', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Telefone</label>
                  <input 
                    type="text" 
                    value={editingClient.telefone} 
                    onChange={e => handleModalChange('telefone', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Endereço Completo</label>
                  <textarea 
                    value={editingClient.endereco} 
                    onChange={e => handleModalChange('endereco', e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)', minHeight: '80px', resize: 'vertical' }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Valor Pendente (R$)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editingClient.valor} 
                    onChange={e => handleModalChange('valor', parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setEditingClient(null)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={16} /> Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Caixa;

