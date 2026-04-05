import React, { useState, useMemo } from 'react';
import { 
  Calendar, Clock, CheckCircle2, Package, Users, Building2,
  ChevronDown, ChevronRight, ShoppingBag, AlertCircle, Plus, X,
  TrendingUp, Truck
} from 'lucide-react';
import '../styles/admin/dashboard.css';
import { useClientes } from '../context/ClientesContext';

// Horário limite para agendamento do dia seguinte
const HORARIO_LIMITE = '18:00';

const STATUS_AGENDAMENTO = {
  pendente: { label: 'Aguardando', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  confirmado: { label: 'Confirmado', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  preparo: { label: 'Em Preparo', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  entregue: { label: 'Entregue', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  cancelado: { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

// Mock de pedidos agendados (em produção, viria do Supabase)
const MOCK_AGENDAMENTOS_CRISDU = [
  { id: 'AG001', grupo: 'Cris du', cliente: 'Ana Costa', itens: '1x Pastelão Frango c/catupiry', total: 27.99, status: 'pendente', horarioEntrega: '12:00', pedidoEm: '09:30' },
  { id: 'AG002', grupo: 'Cris du', cliente: 'Bruno Lima', itens: '1x Cachorro Quente Especial + Coca 600ml', total: 28.50, status: 'pendente', horarioEntrega: '12:00', pedidoEm: '09:45' },
  { id: 'AG003', grupo: 'Cris du', cliente: 'Carla Mendes', itens: '1x Pastelão Carne + Suco Laranja', total: 33.49, status: 'confirmado', horarioEntrega: '12:00', pedidoEm: '08:20' },
  { id: 'AG004', grupo: 'Cris du', cliente: 'Diego Santos', itens: '2x Cachorro Quente Especial', total: 43.00, status: 'pendente', horarioEntrega: '12:00', pedidoEm: '10:15' },
  { id: 'AG005', grupo: 'Outros', cliente: 'Fernanda Oliveira', itens: '1x X-Tudo Artesanal + Fritas', total: 52.90, status: 'pendente', horarioEntrega: '13:00', pedidoEm: '11:00' },
];

function badgeStatus(status) {
  const s = STATUS_AGENDAMENTO[status] || STATUS_AGENDAMENTO.pendente;
  return (
    <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.6rem', borderRadius: '20px', background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default function Agendamentos() {
  const [agendamentos, setAgendamentos] = useState(MOCK_AGENDAMENTOS_CRISDU);
  const [filtroGrupo, setFiltroGrupo] = useState('todos');
  const [expandidos, setExpandidos] = useState({ 'Cris du': true });
  const [showNovoAgendamento, setShowNovoAgendamento] = useState(false);
  const [novoItem, setNovoItem] = useState({ cliente: '', itens: '', total: '', horarioEntrega: '18:45', grupo: 'Cris du' });
  const { clientes, fetchData } = useClientes();
  const [loadingAprovacao, setLoadingAprovacao] = useState(false);

  // Lista de clientes que solicitaram vínculo e estão pendentes
  const solicitacoesPendentes = useMemo(() => {
    return clientes.filter(c => c.status_empresa === 'pendente');
  }, [clientes]);

  const aprovarCliente = async (id) => {
    setLoadingAprovacao(true);
    const { error } = await supabase.from('clientes').update({ status_empresa: 'aprovada' }).eq('id', id);
    if (!error) {
      alert('Cliente aprovado com sucesso!');
      if(fetchData) fetchData();
      else window.location.reload();
    } else {
      alert('Erro ao aprovar cliente: ' + error.message);
    }
    setLoadingAprovacao(false);
  };

  const amanha = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  }, []);

  const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dentroDoHorario = horaAtual < HORARIO_LIMITE;

  // Agrupar por grupo
  const grupos = useMemo(() => {
    const g = {};
    agendamentos
      .filter(a => filtroGrupo === 'todos' || a.grupo === filtroGrupo)
      .forEach(a => {
        if (!g[a.grupo]) g[a.grupo] = [];
        g[a.grupo].push(a);
      });
    return g;
  }, [agendamentos, filtroGrupo]);

  const gruposDisponiveis = [...new Set(agendamentos.map(a => a.grupo))];

  // Métricas
  const totalGeral = agendamentos.reduce((s, a) => s + Number(a.total), 0);
  const totalCrisDu = agendamentos.filter(a => a.grupo === 'Cris du').reduce((s, a) => s + Number(a.total), 0);
  const pendentes = agendamentos.filter(a => a.status === 'pendente').length;

  // Ações
  const mudarStatus = (id, novoStatus) => {
    setAgendamentos(p => p.map(a => a.id === id ? { ...a, status: novoStatus } : a));
  };

  const confirmarEmLote = (grupo) => {
    setAgendamentos(p => p.map(a => a.grupo === grupo && a.status === 'pendente' ? { ...a, status: 'confirmado' } : a));
  };

  const adicionarAgendamento = () => {
    if (!novoItem.cliente || !novoItem.itens) return;
    const novo = {
      id: `AG${Date.now()}`,
      grupo: novoItem.grupo,
      cliente: novoItem.cliente,
      itens: novoItem.itens,
      total: parseFloat(novoItem.total.replace(',', '.')) || 0,
      status: 'pendente',
      horarioEntrega: novoItem.horarioEntrega,
      pedidoEm: horaAtual,
    };
    setAgendamentos(p => [novo, ...p]);
    setNovoItem({ cliente: '', itens: '', total: '', horarioEntrega: '12:00', grupo: 'Cris du' });
    setShowNovoAgendamento(false);
  };

  const toggleExpandir = (grupo) => setExpandidos(e => ({ ...e, [grupo]: !e[grupo] }));

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Agendamentos</h2>
          <p>Pedidos programados para entrega no dia seguinte — {amanha}.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Status do horário */}
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem',
            padding: '0.4rem 0.8rem', borderRadius: '20px',
            background: dentroDoHorario ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: dentroDoHorario ? '#22c55e' : '#ef4444',
          }}>
            <Clock size={13}/>
            {dentroDoHorario ? `Aberto até ${HORARIO_LIMITE}` : `Encerrado (limite: ${HORARIO_LIMITE})`}
          </div>
          <button className="btn vini-btn-primary" onClick={() => setShowNovoAgendamento(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={14}/> Novo Agendamento
          </button>
        </div>
      </header>

      {/* ÁREA DE SOLICITACOES DE APROVACAO DE FABRICA */}
      {solicitacoesPendentes.length > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b' }}>
            <AlertCircle size={20} /> Solicitações de Vínculo (Fábricas)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {solicitacoesPendentes.map(cli => (
              <div key={cli.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: '#1e293b' }}>{cli.nome} <span style={{ fontSize: '0.7rem', background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '8px', color: '#475569' }}>{cli.empresa}</span></div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.3rem' }}>
                    CPF: {cli.cpf} • Setor: {cli.setor} • Cadastrado em: {new Date(cli.created_at).toLocaleDateString()}
                  </div>
                </div>
                <button 
                  onClick={() => aprovarCliente(cli.id)}
                  disabled={loadingAprovacao}
                  style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {loadingAprovacao ? 'Salvando...' : 'Aprovar Vínculo'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MÉTRICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="metric-card vini-glass-panel">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={13}/> Entrega Amanhã
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800' }}>{agendamentos.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>pedidos agendados</div>
        </div>
        <div className="metric-card vini-glass-panel">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Building2 size={13}/> Grupo Cris du
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ea3800' }}>
            {agendamentos.filter(a => a.grupo === 'Cris du').length}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#ea3800' }}>R$ {totalCrisDu.toFixed(2).replace('.', ',')}</div>
        </div>
        <div className="metric-card vini-glass-panel">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={13}/> Pendentes
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b' }}>{pendentes}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>aguardando confirmação</div>
        </div>
        <div className="metric-card vini-glass-panel">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={13}/> Total Agendado
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#22c55e' }}>
            R$ {totalGeral.toFixed(2).replace('.', ',')}
          </div>
        </div>
      </div>

      {/* FILTRO */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['todos', ...gruposDisponiveis].map(g => (
          <button key={g} onClick={() => setFiltroGrupo(g)}
            style={{
              padding: '0.4rem 0.9rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: '600',
              background: filtroGrupo === g ? 'var(--c-red)' : 'var(--bg-surface-elevated)',
              color: filtroGrupo === g ? '#fff' : 'var(--text-secondary)',
            }}>
            {g === 'todos' ? 'Todos os Grupos' : g}
            {g === 'Cris du' && (
              <span style={{ marginLeft: '0.3rem', fontSize: '0.7rem', opacity: 0.8 }}>
                ({agendamentos.filter(a => a.grupo === 'Cris du').length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* GRUPOS */}
      {Object.entries(grupos).map(([grupo, pedidos]) => (
        <div key={grupo} className="vini-glass-panel" style={{ marginBottom: '1rem', overflow: 'hidden' }}>
          {/* Header do grupo */}
          <div 
            style={{ 
              padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
              cursor: 'pointer', background: grupo === 'Cris du' ? 'rgba(234,56,0,0.05)' : 'transparent',
              borderBottom: expandidos[grupo] ? '1px solid var(--border-color)' : 'none'
            }}
            onClick={() => toggleExpandir(grupo)}
          >
            <Building2 size={20} color={grupo === 'Cris du' ? '#ea3800' : 'var(--text-secondary)'}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {grupo}
                {grupo === 'Cris du' && (
                  <span style={{ fontSize: '0.7rem', background: '#ea3800', color: '#fff', padding: '0.1rem 0.5rem', borderRadius: '10px' }}>
                    EMPRESA PARCEIRA
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {pedidos.length} pedido(s) • Total: R$ {pedidos.reduce((s, p) => s + Number(p.total), 0).toFixed(2).replace('.', ',')} • Entrega: {pedidos[0]?.horarioEntrega}
              </div>
            </div>
            {/* Confirmar em lote */}
            {pedidos.some(p => p.status === 'pendente') && (
              <button 
                className="btn vini-btn-primary" 
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', whiteSpace: 'nowrap' }}
                onClick={e => { e.stopPropagation(); confirmarEmLote(grupo); }}
              >
                ✓ Confirmar Todos
              </button>
            )}
            {expandidos[grupo] ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
          </div>

          {/* Lista de pedidos */}
          {expandidos[grupo] && (
            <div>
              {pedidos.map((p, i) => (
                <div key={p.id} style={{ 
                  padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
                  borderBottom: i < pedidos.length - 1 ? '1px solid var(--border-color)' : 'none'
                }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Users size={16} color="var(--text-secondary)"/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{p.cliente}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{p.itens}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      <Clock size={10} style={{ display: 'inline', marginRight: '0.2rem' }}/>
                      Pedido às {p.pedidoEm} • Entrega: {p.horarioEntrega}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: '700', color: 'var(--c-red)', marginBottom: '0.3rem' }}>
                      R$ {Number(p.total).toFixed(2).replace('.', ',')}
                    </div>
                    {badgeStatus(p.status)}
                  </div>
                  {/* Ações */}
                  <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                    {p.status === 'pendente' && (
                      <button onClick={() => mudarStatus(p.id, 'confirmado')}
                        style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: '0.75rem', fontWeight: '600' }}>
                        ✓
                      </button>
                    )}
                    {p.status === 'confirmado' && (
                      <button onClick={() => mudarStatus(p.id, 'preparo')}
                        style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', fontSize: '0.75rem', fontWeight: '600' }}>
                        🍳
                      </button>
                    )}
                    {p.status === 'preparo' && (
                      <button onClick={() => mudarStatus(p.id, 'entregue')}
                        style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontSize: '0.75rem', fontWeight: '600' }}>
                        🛵
                      </button>
                    )}
                    {p.status !== 'cancelado' && p.status !== 'entregue' && (
                      <button onClick={() => mudarStatus(p.id, 'cancelado')}
                        style={{ padding: '0.3rem 0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.75rem' }}>
                        <X size={12}/>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* MODAL NOVO AGENDAMENTO */}
      {showNovoAgendamento && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowNovoAgendamento(false)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '90%' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Novo Agendamento</h3>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setShowNovoAgendamento(false)}>
                <X size={20}/>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Grupo / Empresa</label>
                <select value={novoItem.grupo} onChange={e => setNovoItem(p => ({ ...p, grupo: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', boxSizing: 'border-box' }}>
                  <option value="Cris du">Cris du</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Cliente *</label>
                <input value={novoItem.cliente} onChange={e => setNovoItem(p => ({ ...p, cliente: e.target.value }))}
                  placeholder="Nome do funcionário" list="clientes-lista"
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', boxSizing: 'border-box' }}/>
                <datalist id="clientes-lista">
                  {clientes.map(c => <option key={c.id} value={c.nome}/>)}
                </datalist>
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Itens do Pedido *</label>
                <input value={novoItem.itens} onChange={e => setNovoItem(p => ({ ...p, itens: e.target.value }))}
                  placeholder="Ex: 1x Pastelão Carne + Suco"
                  style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', boxSizing: 'border-box' }}/>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Total (R$)</label>
                  <input value={novoItem.total} onChange={e => setNovoItem(p => ({ ...p, total: e.target.value }))}
                    placeholder="0,00"
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', boxSizing: 'border-box' }}/>
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Horário de Entrega</label>
                  <input type="time" value={novoItem.horarioEntrega} onChange={e => setNovoItem(p => ({ ...p, horarioEntrega: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', boxSizing: 'border-box' }}/>
                </div>
              </div>
              <button className="btn vini-btn-primary" onClick={adicionarAgendamento}
                style={{ marginTop: '0.5rem', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Calendar size={16}/> Agendar para Amanhã — {amanha}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
