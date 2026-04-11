import React, { useState, useEffect } from 'react';
import { Bike, MapPin, Clock, Search, Navigation, UserCheck, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { orders, rh } from '../services/api';
import '../styles/admin/dashboard.css';

function Entregas() {
  const [activeTab, setActiveTab] = useState('expedicao');
  const [pedidos, setPedidos] = useState([]);
  const [equipe, setEquipe] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    setLoading(true);
    try {
      const [resOrders, resStaff] = await Promise.all([
        orders.listAll(),
        rh.list()
      ]);
      
      if (resOrders.success) setPedidos(resOrders.data || []);
      if (resStaff.success) setEquipe(resStaff.data || []);
    } catch (err) {
      console.error('Erro ao buscar dados logística:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDespachar = async (pedidoId) => {
    const boys = equipe.filter(e => e.cargo.toLowerCase().includes('motoboy') || e.cargo.toLowerCase().includes('entregador'));
    if (boys.length === 0) return alert('Nenhum motoboy cadastrado no RH para despacho.');

    const boyName = window.prompt(`Digite o ID ou Nome do motoboy:\n${boys.map(b => `${b.id}: ${b.nome}`).join('\n')}`);
    if (!boyName) return;

    try {
      // Tentar encontrar por ID ou Nome parcial
      const boy = boys.find(b => b.id === boyName || b.nome.toLowerCase().includes(boyName.toLowerCase()));
      if (!boy) return alert('Motoboy não encontrado.');

      const res = await orders.despachar(pedidoId, boy.id);
      if (res.success) fetchDados();
    } catch (err) {
      alert('Erro ao despachar: ' + err);
    }
  };

  const handleConcluir = async (pedidoId) => {
    try {
      const res = await orders.updateStatus(pedidoId, 'concluido');
      if (res.success) fetchDados();
    } catch (err) {
      alert('Erro ao concluir entrega');
    }
  };

  // Filtros
  const motoboys = equipe.filter(e => e.cargo.toLowerCase().includes('motoboy') || e.cargo.toLowerCase().includes('entregador'));
  const expedicao = pedidos.filter(p => (JSON.parse(p.endereco_entrega || '{}').tipo === 'entrega' || p.endereco_entrega?.includes('logradouro')) && p.status !== 'concluido' && p.status !== 'cancelado');
  
  const metrics = {
    ativos: motoboys.filter(m => m.status === 'ativo').length,
    frotaTotal: motoboys.length,
    concluidosHoje: pedidos.filter(p => p.status === 'concluido' && new Date(p.created_at).toDateString() === new Date().toDateString()).length
  };

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem', background: 'var(--bg-base)' }}>
      <header className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2>Gestão de Entregas & Logística</h2>
          <p className="text-secondary">Controle real de motoboys e quadro de expedição sincronizado.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem' }}>
          <button className="vini-btn-outline" onClick={fetchDados}><RefreshCw size={18} /> Atualizar</button>
        </div>
      </header>

      {/* MÉTRICAS KPI REAIS */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper blue"><Bike size={24} color="var(--c-blue)" /></div>
          <div className="stat-info">
            <span className="stat-label">Motoboys Ativos</span>
            <h3 className="stat-value">{metrics.ativos} / {metrics.frotaTotal}</h3>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper purple"><Clock size={24} color="#8b5cf6" /></div>
          <div className="stat-info">
            <span className="stat-label">Aguardando Coleta</span>
            <h3 className="stat-value">{expedicao.filter(e => e.status !== 'em_rota').length}</h3>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper green"><ShieldCheck size={24} color="var(--c-green)" /></div>
          <div className="stat-info">
            <span className="stat-label">Concluídas Hoje</span>
            <h3 className="stat-value">{metrics.concluidosHoje}</h3>
          </div>
        </div>
      </div>

      <div className="vini-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button onClick={() => setActiveTab('expedicao')} style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: activeTab === 'expedicao' ? '700' : '500', color: activeTab === 'expedicao' ? 'var(--c-red)' : 'var(--text-secondary)', paddingBottom: '0.5rem', borderBottom: activeTab === 'expedicao' ? '2px solid var(--c-red)' : 'none', cursor: 'pointer' }}>Quadro de Expedição</button>
        <button onClick={() => setActiveTab('motoboys')} style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: activeTab === 'motoboys' ? '700' : '500', color: activeTab === 'motoboys' ? 'var(--c-red)' : 'var(--text-secondary)', paddingBottom: '0.5rem', borderBottom: activeTab === 'motoboys' ? '2px solid var(--c-red)' : 'none', cursor: 'pointer' }}>Entregadores (RH)</button>
      </div>

      {activeTab === 'expedicao' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={18} color="var(--c-yellow)" /> Cozinha / Pronto p/ Coleta</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {expedicao.filter(e => e.status !== 'em_rota').map(pedido => {
                const end = JSON.parse(pedido.endereco_entrega || '{}');
                return (
                  <div key={pedido.id} style={{ background: 'var(--bg-surface-elevated)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.3rem' }}>Pedido #{pedido.id.substring(0,4)} - {pedido.cliente_nome || 'Consumidor'}</h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><MapPin size={14} /> {end.bairro || 'End. não inf.'}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <button onClick={() => handleDespachar(pedido.id)} className="vini-btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Despachar</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Navigation size={18} color="var(--c-blue)" /> Em Rota de Entrega</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {expedicao.filter(e => e.status === 'em_rota').map(pedido => {
                const end = JSON.parse(pedido.endereco_entrega || '{}');
                return (
                  <div key={pedido.id} style={{ background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.3rem' }}>Pedido #{pedido.id.substring(0,4)}</h4>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{end.bairro}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--c-blue)', fontWeight: '600', display: 'block', marginTop: '0.3rem' }}>Com: {pedido.motoboy_nome || '---'}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <button onClick={() => handleConcluir(pedido.id)} className="vini-btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Marcar Entregue</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'motoboys' && (
        <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}><h3 style={{ margin: 0 }}>Entregadores Ativos (Time Interno)</h3></div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Entregador</th>
                  <th>Status</th>
                  <th>Cargo</th>
                  <th>Desde</th>
                </tr>
              </thead>
              <tbody>
                {motoboys.map((moto) => (
                  <tr key={moto.id}>
                    <td><div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Bike size={16} /> <strong>{moto.nome}</strong></div></td>
                    <td><span className={`vini-badge ${moto.status === 'ativo' ? 'success' : 'neutral'}`}>{moto.status.toUpperCase()}</span></td>
                    <td>{moto.cargo}</td>
                    <td>{new Date(moto.created_at).toLocaleDateString()}</td>
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
