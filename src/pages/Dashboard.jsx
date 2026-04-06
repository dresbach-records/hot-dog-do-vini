import React, { useMemo } from 'react';
import { DollarSign, ShoppingCart, Activity, AlertCircle } from 'lucide-react';
import { useClientes } from '../context/ClientesContext';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import '../styles/admin/dashboard.css';

// --- MOCK DATA PARA GRÁFICOS HISTÓRICOS INEXISTENTES NO CONTEXTO ATUAL ---
const MOCK_FATURAMENTO_DIARIO = [
  { dia: '15/03', vendas: 210 },
  { dia: '16/03', vendas: 180 },
  { dia: '17/03', vendas: 350 },
  { dia: '18/03', vendas: 190 },
  { dia: '19/03', vendas: 275 },
  { dia: '20/03', vendas: 420 },
  { dia: '21/03', vendas: 595.99 }, // Hoje
];

const MOCK_FLUXO_CAIXA = [
  { dia: 'Segunda', entradas: 320, saidas: 150 },
  { dia: 'Terça', entradas: 250, saidas: 80 },
  { dia: 'Quarta', entradas: 410, saidas: 200 },
  { dia: 'Quinta', entradas: 300, saidas: 120 },
  { dia: 'Sexta', entradas: 580, saidas: 250 },
  { dia: 'Sábado', entradas: 750, saidas: 300 },
  { dia: 'Domingo', entradas: 620, saidas: 180 },
];

const MOCK_VENDAS_SEMANA = [
  { dia: 'Seg', valor: 320 },
  { dia: 'Ter', valor: 250 },
  { dia: 'Qua', valor: 410 },
  { dia: 'Qui', valor: 300 },
  { dia: 'Sex', valor: 580 },
  { dia: 'Sáb', valor: 750 },
  { dia: 'Dom', valor: 620 },
];

const MOCK_PRODUTOS = [
  { nome: 'Pastel Frango', qtd: 45 },
  { nome: 'Pastel Carne', qtd: 38 },
  { nome: 'Coca-cola 2L', qtd: 30 },
  { nome: 'X-Tudo', qtd: 25 },
  { nome: 'X-Bacon', qtd: 18 },
];

const MOCK_VENCIMENTOS = [
  { status: 'Atrasado', valor: 85.50 },
  { status: 'Hoje', valor: 145.00 },
  { status: 'Amanhã', valor: 65.00 },
  { status: 'No Prazo', valor: 84.57 },
];

function Dashboard() {
  const { clientes, resumo, pagamentosConfirmados } = useClientes();

  const metrics = useMemo(() => {
    let totalSales = 0;
    let totalPago = 0;
    let totalFiado = 0;
    let totalItems = 0;
    
    let clientesDevedores = [];

    clientes.forEach(cliente => {
      // Usando array de quem realmente pagou pra gerar o valor dinâmico global
      const foiPago = pagamentosConfirmados.includes(cliente.id);
      
      const gastoCliente = cliente.total_cliente || 0;
      const valorFiado = (foiPago ? 0 : (cliente.saldo_devedor || cliente.total_cliente || 0));
      const valorPago = (foiPago ? gastoCliente : (cliente.total_pago || 0));

      totalSales += gastoCliente;
      totalPago += valorPago;
      totalFiado += valorFiado;

      if (cliente.pedidos) {
        totalItems += cliente.pedidos.length;
      }

      if (valorFiado > 0) {
        clientesDevedores.push({
          nome: cliente.nome,
          valor: valorFiado
        });
      }
    });

    clientesDevedores.sort((a, b) => b.valor - a.valor);
    const topDevedores = clientesDevedores.slice(0, 5);

    const pizzaRecebimentos = [
      { name: 'Recebido (Caixa)', value: resumo.total_recebido_confirmado || 0 },
      { name: 'Em Aberto (Fiado)', value: resumo.total_em_aberto_estimado || 0 },
    ];

    return { 
      totalSales: resumo.total_vendas_estimado || 0, 
      totalPago: resumo.total_recebido_confirmado || 0, 
      totalFiado: resumo.total_em_aberto_estimado || 0, 
      totalItems: resumo.total_pedidos || 0, 
      topDevedores, 
      pizzaRecebimentos 
    };
  }, [clientes, resumo, pagamentosConfirmados]);

  // Cores personalizadas e Tooltip padronizado
  const PIE_COLORS = ['#22c55e', '#ef4444']; 
  const customTooltipStyle = { backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.9rem' };

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1rem' }}>
      <header className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Painel Executivo</h2>
          <p className="text-secondary">Indicadores essenciais de Faturamento e Controle de Fiados.</p>
        </div>
      </header>

      {/* 8. KPI (CARDS NO TOPO) */}
      <section className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="vini-card-stat vini-glass-panel">
          <div className="stat-icon-wrapper blue">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Vendido</span>
            <h3 className="stat-value">R$ {metrics.totalSales.toFixed(2).replace('.', ',')}</h3>
            <span className="stat-trend neutral">Volume bruto comercializado</span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel">
          <div className="stat-icon-wrapper green">
            <Activity size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Recebido (Caixa)</span>
            <h3 className="stat-value text-positive" style={{ color: '#22c55e' }}>R$ {metrics.totalPago.toFixed(2).replace('.', ',')}</h3>
            <span className="stat-trend positive">
               {metrics.totalSales > 0 ? ((metrics.totalPago / metrics.totalSales)*100).toFixed(0) : 0}% convertido
            </span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="stat-icon-wrapper red">
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Em Aberto (Fiado)</span>
            <h3 className="stat-value text-negative" style={{ color: '#ef4444' }}>R$ {metrics.totalFiado.toFixed(2).replace('.', ',')}</h3>
            <span className="stat-trend negative">
              {metrics.totalSales > 0 ? ((metrics.totalFiado / metrics.totalSales)*100).toFixed(0) : 0}% em risco
            </span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel">
          <div className="stat-icon-wrapper yellow">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Nº de Pedidos</span>
            <h3 className="stat-value">{metrics.totalItems} un.</h3>
            <span className="stat-trend neutral">Logística despachada</span>
          </div>
        </div>
      </section>

      {/* MEIO: FATURAMENTO (LINHA) & RECEBIDO VS ABERTO (PIZZA) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* 1. FATURAMENTO */}
        <div className="vini-glass-panel" style={{ padding: '1.5rem', flex: 2 }}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>FATURAMENTO</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--c-blue)' }}>Evolução de vendas por dia</span>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={MOCK_FATURAMENTO_DIARIO} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="dia" stroke="var(--text-secondary)" fontSize={12} tickMargin={10} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickFormatter={(value) => `R$${value}`} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Line type="monotone" dataKey="vendas" stroke="var(--c-blue)" strokeWidth={3} dot={{ r: 4, fill: 'var(--c-blue)' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. RECEBIDO VS EM ABERTO */}
        <div className="vini-glass-panel" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="section-header" style={{ marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>RECEBIDO VS EM ABERTO</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--c-red)' }}>Indicador crítico de liquidez (Dados Reais)</span>
          </div>
          <div style={{ width: '100%', flex: 1, minHeight: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={metrics.pizzaRecebimentos}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {metrics.pizzaRecebimentos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ABAIXO: 5 Gráficos Analíticos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* 3. CLIENTES DEVEDORES */}
        <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>CLIENTES DEVEDORES</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ranking (Dados Reais do Caixa)</span>
          </div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={metrics.topDevedores} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis dataKey="nome" type="category" stroke="var(--text-secondary)" fontSize={12} width={80} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Bar dataKey="valor" fill="var(--c-red)" radius={[0, 4, 4, 0]} barSize={20}>
                   {metrics.topDevedores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#b91c1c' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. PRODUTOS MAIS VENDIDOS */}
        <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>PRODUTOS MAIS VENDIDOS</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>O que mais sai na cozinha</span>
          </div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={MOCK_PRODUTOS} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis dataKey="nome" type="category" stroke="var(--text-secondary)" fontSize={12} width={80} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(value) => `${value} un.`} />
                <Bar dataKey="qtd" fill="#eab308" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. VENDAS POR DIA DA SEMANA */}
        <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>VENDAS POR DIA</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Média semanal financeira</span>
          </div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={MOCK_VENDAS_SEMANA} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="dia" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(value) => `R$ ${value}`} />
                <Bar dataKey="valor" fill="var(--c-blue)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. FIADO POR VENCIMENTO */}
        <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>FIADO VENCIMENTO</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Visão temporal do risco</span>
          </div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={MOCK_VENCIMENTOS} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="status" stroke="var(--text-secondary)" fontSize={10} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(value) => `R$ ${value.toFixed(2).replace('.', ',')}`} />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]} barSize={20}>
                  {MOCK_VENCIMENTOS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.status === 'Atrasado' ? '#ef4444' : entry.status === 'Hoje' ? '#eab308' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7. FLUXO DE CAIXA */}
        <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>FLUXO DE CAIXA</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Entradas x Saídas Reais</span>
          </div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={MOCK_FLUXO_CAIXA} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="dia" stroke="var(--text-secondary)" fontSize={10} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend verticalAlign="top" height={30} iconType="plainline" wrapperStyle={{ fontSize: '11px' }}/>
                <Line type="monotone" name="Entradas" dataKey="entradas" stroke="#22c55e" strokeWidth={2} dot={{ r: 2 }} />
                <Line type="monotone" name="Saídas" dataKey="saidas" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
