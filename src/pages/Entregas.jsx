import React, { useState } from 'react';
import { Bike, MapPin, Clock, Search, Navigation, UserCheck, ShieldCheck, AlertCircle } from 'lucide-react';
import '../styles/admin/dashboard.css';

function Entregas() {
  const [activeTab, setActiveTab] = useState('expedicao');

  // Mocks
  const expedicao = [
    { id: '1042', status: 'Aguardando Motoboy', tempo: '10 min', cliente: 'Guilherme', bairro: 'Centro', valor: 45.90 },
    { id: '1043', status: 'Em Rota', tempo: 'Em trânsito', cliente: 'Ana Luiza', bairro: 'Santa Rosa', valor: 32.50, motoboy: 'Carlos' },
    { id: '1044', status: 'Em Rota', tempo: 'Em trânsito', cliente: 'Fernando', bairro: 'Cruzeiro', valor: 88.00, motoboy: 'Roberto' },
  ];

  const motoboys = [
    { id: 1, nome: 'Carlos Silva', status: 'Em Rota', entregasHoje: 12, taxaReceber: 60.00, pneu: 'Ok', placa: 'IWD-9090' },
    { id: 2, nome: 'Roberto Alves', status: 'Em Rota', entregasHoje: 8, taxaReceber: 40.00, pneu: 'Atenção', placa: 'IXO-1234' },
    { id: 3, nome: 'Tiago', status: 'Disponível', entregasHoje: 4, taxaReceber: 20.00, pneu: 'Ok', placa: 'IJB-5544' },
    { id: 4, nome: 'Matheus', status: 'Offline', entregasHoje: 0, taxaReceber: 0.00, pneu: 'Ok', placa: 'KKY-0012' },
  ];

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem', background: 'var(--bg-base)' }}>
      <header className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2>Gestão de Entregas & Logística</h2>
          <p className="text-secondary">Controle de motoboys, quadro de expedição e taxas por bairro.</p>
        </div>
        <div className="header-actions">
          <button className="vini-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={18} /> Cadastrar Entregador
          </button>
        </div>
      </header>

      {/* MÉTRICAS KPI */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-blue-light">
            <Bike size={24} color="var(--c-blue)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Motoboys Ativos</span>
            <h3 className="stat-value text-primary">3 / 4</h3>
            <span className="stat-trend positive">75% da frota operando</span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-yellow-light">
            <Clock size={24} color="var(--c-yellow)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Tempo Médio Rota</span>
            <h3 className="stat-value">18 min</h3>
            <span className="stat-trend positive">No prazo ideal</span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-green-light">
            <ShieldCheck size={24} color="var(--c-green)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Entregas Concluídas</span>
            <h3 className="stat-value text-positive">24</h3>
            <span className="stat-trend neutral">R$ 120,00 gerados em taxas</span>
          </div>
        </div>
      </div>

      <div className="vini-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('expedicao')}
          style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: activeTab === 'expedicao' ? '700' : '500', color: activeTab === 'expedicao' ? 'var(--c-red)' : 'var(--text-secondary)', paddingBottom: '0.5rem', borderBottom: activeTab === 'expedicao' ? '2px solid var(--c-red)' : '2px solid transparent', cursor: 'pointer' }}
        >
          Quadro de Expedição
        </button>
        <button 
          onClick={() => setActiveTab('motoboys')}
          style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: activeTab === 'motoboys' ? '700' : '500', color: activeTab === 'motoboys' ? 'var(--c-red)' : 'var(--text-secondary)', paddingBottom: '0.5rem', borderBottom: activeTab === 'motoboys' ? '2px solid var(--c-red)' : '2px solid transparent', cursor: 'pointer' }}
        >
          Frota e Motoboys
        </button>
      </div>

      {activeTab === 'expedicao' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'reapete(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="vini-glass-panel" style={{ padding: '1.5rem', flex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--c-yellow)" /> Aguardando Coleta (Cozinha)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {expedicao.filter(e => e.status === 'Aguardando Motoboy').map(pedido => (
                <div key={pedido.id} style={{ background: 'var(--bg-surface-elevated)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.3rem' }}>Pedido #{pedido.id} - {pedido.cliente}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} /> {pedido.bairro}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="vini-badge-warning">{pedido.tempo}</span>
                    <button className="vini-btn-primary" style={{ display: 'block', marginTop: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Despachar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="vini-glass-panel" style={{ padding: '1.5rem', flex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Navigation size={18} color="var(--c-blue)" /> Em Rota (Na rua)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {expedicao.filter(e => e.status === 'Em Rota').map(pedido => (
                <div key={pedido.id} style={{ background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                    <h4 style={{ margin: '0 0 0.3rem' }}>Pedido #{pedido.id} - {pedido.cliente}</h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} /> {pedido.bairro}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--c-blue)', fontWeight: '600', display: 'block', marginTop: '0.3rem' }}>Com: {pedido.motoboy}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="vini-badge" style={{ background: 'var(--c-blue)', color: '#fff' }}>Em Rota</span>
                    <button className="vini-btn-outline" style={{ display: 'block', marginTop: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Marcar Entregue</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'motoboys' && (
        <div className="vini-glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="section-header" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Quadro da Frota Própria</h3>
            <div className="search-box" style={{ background: 'var(--bg-surface-elevated)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)' }}>
               <Search size={16} color="var(--text-secondary)" />
               <input type="text" placeholder="Buscar entregador..." style={{ border: 'none', background: 'transparent', color: 'var(--text-primary)', outline: 'none' }} />
            </div>
          </div>
          <div className="table-responsive">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-active)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Motoboy</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Entregas Hoje</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Taxas a Pagar</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Danos/Obs</th>
                </tr>
              </thead>
              <tbody>
                {motoboys.map((moto, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', opacity: moto.status === 'Offline' ? 0.6 : 1 }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-active)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Bike size={16} color={moto.status === 'Offline' ? 'var(--text-muted)' : 'var(--text-primary)'} />
                        </div>
                        <div>
                          <strong style={{ display: 'block' }}>{moto.nome}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{moto.placa}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`vini-badge ${moto.status === 'Em Rota' ? 'success' : (moto.status === 'Disponível' ? 'warning' : 'neutral')}`} style={{ background: moto.status === 'Em Rota' ? 'rgba(59, 130, 246, 0.15)' : undefined, color: moto.status === 'Em Rota' ? 'var(--c-blue)' : undefined }}>
                        {moto.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>{moto.entregasHoje} un.</td>
                    <td style={{ padding: '1rem', color: 'var(--text-positive)' }}>R$ {moto.taxaReceber.toFixed(2).replace('.', ',')}</td>
                    <td style={{ padding: '1rem' }}>
                      {moto.pneu === 'Ok' ? (
                        <span style={{ color: 'var(--text-secondary)' }}>Ok</span>
                      ) : (
                        <span style={{ color: 'var(--c-yellow)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><AlertCircle size={14} /> Pneu careca</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Entregas;
