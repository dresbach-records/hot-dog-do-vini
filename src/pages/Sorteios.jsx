import React, { useMemo, useState } from 'react';
import { Gift, Users, Ban, DollarSign, Trophy, History, Activity } from 'lucide-react';
import { useClientes } from '../context/ClientesContext';
import { 
  PieChart, Pie, Cell, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import '../assets/styles/Dashboard.css';

function Sorteios() {
  const { clientes, pagamentosConfirmados } = useClientes();
  const [historico, setHistorico] = useState([
    // Um mock de histórico para não começar vazio
    { data: '01/03/2026', cliente: 'Guilherme', premio: 'Combo X-Tudo' }
  ]);
  const [isSorting, setIsSorting] = useState(false);
  const [sorteadoAgorinha, setSorteadoAgorinha] = useState(null);

  // Regra de Negócio de Fidelidade: Total > 100 e Saldo Zerado
  const MINIMO_COMPRAS = 100;

  const data = useMemo(() => {
    let elegiveis = [];
    let bloqueados = [];
    let totalComprasElegiveis = 0;

    const clientesProcessados = clientes.map((cliente, index) => {
      const foiPago = pagamentosConfirmados.includes(cliente.id);
      const gastoCliente = cliente.total_cliente || 0;
      const valorFiado = foiPago ? 0 : (cliente.saldo_devedor || cliente.total_cliente || 0);
      
      const atingiuMinimo = gastoCliente >= MINIMO_COMPRAS;
      const estaKite = valorFiado === 0;

      const isEligible = atingiuMinimo && estaKite;

      const clienteRefinado = {
        ...cliente,
        codigoID: cliente.id.split('-')[1] || (1000 + index), // Reaproveitando o numeral do ID real para o display simplificado
        valorFiado,
        gastoAculumado: gastoCliente,
        isEligible,
        statusFidelidade: isEligible ? 'Elegível' : 'Bloqueado',
        razaoBloqueio: !estaKite ? 'Possui Fiado Aberto' : (!atingiuMinimo ? `Compras < R$ ${MINIMO_COMPRAS}` : '')
      };

      if (isEligible) {
        elegiveis.push(clienteRefinado);
        totalComprasElegiveis += gastoCliente;
      } else {
        bloqueados.push(clienteRefinado);
      }

      return clienteRefinado;
    });

    const topClientes = [...clientesProcessados]
      .sort((a, b) => b.gastoAculumado - a.gastoAculumado)
      .slice(0, 5);

    const pizzaData = [
      { name: 'Elegíveis', value: elegiveis.length },
      { name: 'Bloqueados', value: bloqueados.length }
    ];

    return { elegiveis, bloqueados, totalComprasElegiveis, clientesLista: clientesProcessados, topClientes, pizzaData };
  }, [clientes, pagamentosConfirmados]);

  // Ação de Sorteio
  const handleRealizarSorteio = () => {
    if (data.elegiveis.length === 0) {
      alert("Não há clientes elegíveis para realizar o sorteio hoje!");
      return;
    }

    setIsSorting(true);
    setSorteadoAgorinha(null);
    
    setTimeout(() => {
      const vencedorSorteado = data.elegiveis[Math.floor(Math.random() * data.elegiveis.length)];
      
      const novoRegistro = {
        data: new Date().toLocaleDateString('pt-BR'),
        cliente: vencedorSorteado.nome,
        premio: 'Prêmio Fidelidade Vini\'s'
      };
      
      setHistorico(prev => [novoRegistro, ...prev]);
      setSorteadoAgorinha(vencedorSorteado);
      setIsSorting(false);
      
      // Animação boba local apenas por alerta, mas a UI muda.
    }, 2000);
  };

  const customTooltipStyle = { backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem' };

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1rem' }}>
      <header className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2>Fidelização & Sorteios</h2>
          <p className="text-secondary">Sorteio igualitário por Cliente (ID), independente do valor ultrapassado da meta.</p>
        </div>
        <button 
          className={`btn ${isSorting ? 'btn-outline' : 'btn-primary'}`} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', transform: isSorting ? 'scale(0.98)' : 'scale(1)', transition: 'all 0.2s' }}
          onClick={handleRealizarSorteio}
          disabled={isSorting}
        >
          {isSorting ? <Activity className="spin" size={18} /> : <Gift size={18} />}
          {isSorting ? 'Sorteando...' : 'Realizar Sorteio'}
        </button>
      </header>

      {sorteadoAgorinha && (
        <div style={{ background: 'var(--bg-surface-elevated)', border: '2px solid var(--c-red)', padding: '1.5rem', marginBottom: '2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1.5rem', animation: 'bounce 0.5s ease', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.2)' }}>
          <Trophy size={48} color="var(--c-red)" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--c-red)' }}>Temos um Ganhador! 🎉</h3>
            <p style={{ margin: '0.5rem 0', fontSize: '1.05rem', color: 'var(--c-red)', fontWeight: '500' }}>
              O cliente <strong>{sorteadoAgorinha.nome} (ID #{sorteadoAgorinha.codigoID})</strong> acaba de ganhar o Prêmio Fidelidade!
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'white', backgroundColor: 'var(--c-red)', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
              ✦ Aviso de premiação disparado automaticamente via WhatsApp e Portal do Cliente.
            </p>
          </div>
        </div>
      )}

      {/* LINHA 1: KPIs */}
      <section className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-green-light">
            <Users size={24} color="var(--c-green)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Clientes Elegíveis</span>
            <h3 className="stat-value text-positive">{data.elegiveis.length}</h3>
            <span className="stat-trend neutral">R$ {MINIMO_COMPRAS.toFixed(2)} + Sem Devedor</span>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper" style={{ background: 'var(--bg-active)' }}>
            <DollarSign size={24} color="var(--c-blue)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Gasto (Elegíveis)</span>
            <h3 className="stat-value">R$ {data.totalComprasElegiveis.toFixed(2).replace('.', ',')}</h3>
            <span className="stat-trend positive">Fidelidade Saudável</span>
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div className="stat-icon-wrapper bg-red-light">
            <Ban size={24} color="var(--c-red)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Clientes Bloqueados</span>
            <h3 className="stat-value text-negative">{data.bloqueados.length}</h3>
            <span className="stat-trend negative">Inadimplentes ou S/ Mínimo</span>
          </div>
        </div>
      </section>

      {/* LINHA 2: GRÁFICOS (Elegibilidade e Tops) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div className="section-header" style={{ marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>ELEGÍVEIS VS BLOQUEADOS</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status da carteira de clientes</span>
          </div>
          <div style={{ width: '100%', minHeight: 250, flex: 1 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.pizzaData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  <Cell fill="#22c55e" /> {/* Verde elegíveis */}
                  <Cell fill="#ef4444" /> {/* Vermelho bloq */}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div className="section-header" style={{ marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>TOP CLIENTES POR COMPRA</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ranking geral de consumidores</span>
          </div>
          <div style={{ width: '100%', minHeight: 250, flex: 1 }}>
            <ResponsiveContainer>
              <BarChart data={data.topClientes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="nome" stroke="var(--text-secondary)" fontSize={10} />
                <YAxis stroke="var(--text-secondary)" fontSize={10} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Bar dataKey="gastoAculumado" fill="var(--c-blue)" radius={[4, 4, 0, 0]} barSize={35} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* LINHA 3: TABELA E HISTÓRICO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'reapete(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', flex: 2 }}>
          <div className="section-header" style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Base de Clientes (Fidelidade)</h3>
          </div>
          <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-active)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Nome</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Total Compras</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Saldo Devedor</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.clientesLista.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', background: c.isEligible ? 'rgba(34, 197, 94, 0.03)' : 'rgba(239, 68, 68, 0.03)' }}>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontWeight: '500', color: c.isEligible ? 'var(--c-green)' : 'var(--text-primary)' }}>{c.nome}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>R$ {c.gastoAculumado.toFixed(2).replace('.', ',')}</td>
                    <td style={{ padding: '1rem', color: c.valorFiado > 0 ? 'var(--c-red)' : 'var(--text-secondary)' }}>
                      R$ {c.valorFiado.toFixed(2).replace('.', ',')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${c.isEligible ? 'success' : 'negative'}`} style={{ whiteSpace: 'nowrap' }} title={c.razaoBloqueio}>
                        {c.statusFidelidade}
                      </span>
                      {!c.isEligible && <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{c.razaoBloqueio}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, minWidth: '300px' }}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} /> Histórico Sorteios
            </h3>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {historico.map((h, i) => (
              <li key={i} style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{h.data}</span>
                <strong style={{ color: 'var(--c-blue)' }}>{h.cliente}</strong>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{h.premio}</span>
              </li>
            ))}
          </ul>
        </div>
        
      </div>
    </div>
  );
}

export default Sorteios;
