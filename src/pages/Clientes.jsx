import React from 'react';
import { User, Phone, MapPin, DollarSign, Activity, Settings } from 'lucide-react';
import { useClientes } from '../context/ClientesContext';
import '../assets/styles/Dashboard.css';

function Clientes() {
  const { clientes } = useClientes();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Cadastro de Clientes</h2>
          <p>Base unificada de clientes: Histórico de pedidos, endereços e financeiro.</p>
        </div>
        <button className="btn btn-primary">
          + Novo Cliente
        </button>
      </header>
      
      <div className="dashboard-content" style={{ display: 'block' }}>
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-active)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Cliente</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Contato</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Endereço</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Status Conta</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Total Gasto</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente, i) => {
                  const isAdmin = cliente.total_cliente > 100;
                  const saldoFormatado = (cliente.saldo_devedor || cliente.valor || 0).toFixed(2).replace('.', ',');
                  const totalGasto = (cliente.total_cliente || cliente.valor || 0).toFixed(2).replace('.', ',');

                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div className={`avatar ${isAdmin ? 'bg-blue-light' : 'bg-dark-layer'}`} style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} color={isAdmin ? 'var(--c-blue)' : 'var(--text-muted)'} />
                          </div>
                          <div>
                            <span style={{ fontWeight: '600', display: 'block' }}>{cliente.nome}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: #{1000 + i}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          <Phone size={14} />
                          {cliente.telefone || 'Não registrado'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          <MapPin size={14} />
                          {cliente.endereco ? (cliente.endereco.length > 20 ? cliente.endereco.substring(0, 20)+'...' : cliente.endereco) : 'Sem Endereço'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {cliente.status === 'PENDENTE' || cliente.saldo_devedor > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span className="badge warning" style={{ width: 'fit-content' }}>Devedor</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--c-yellow)', marginTop: '0.2rem' }}>R$ {saldoFormatado}</span>
                          </div>
                        ) : (
                          <span className="badge success">Em Dia</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '500' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <DollarSign size={14} color="var(--text-secondary)" />
                          R$ {totalGasto}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn-action secondary" title="Detalhes do Cliente">
                            <Activity size={16} />
                          </button>
                          <button className="btn-action secondary" title="Configurações Conta">
                            <Settings size={16} />
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
    </div>
  );
}

export default Clientes;
