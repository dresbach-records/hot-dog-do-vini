import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line,
  AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Clock, Package, Users, 
  ChevronDown, Filter, Download, Info,
  Search, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import '../styles/admin/dashboard.css';

const dataVendas = [
  { name: 'Seg', vendas: 2400 },
  { name: 'Ter', vendas: 1398 },
  { name: 'Qua', vendas: 9800 },
  { name: 'Qui', vendas: 3908 },
  { name: 'Sex', vendas: 4800 },
  { name: 'Sab', vendas: 3800 },
  { name: 'Dom', vendas: 4300 },
];

function DesempenhoVendas() {
  const [activeTab, setActiveTab] = useState('vendas');

  return (
    <div className="admin-page-container">
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
           <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Desempenho</h1>
           <p style={{ opacity: 0.6 }}>Acompanhe os KPIs de crescimento da sua loja</p>
        </div>
        <div className="header-actions">
           <button className="vini-btn-outline"><Download size={18}/> GERAR RELATÓRIO</button>
        </div>
      </header>

      {/* TABS iFood Style */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: '2rem' }}>
         <button 
           onClick={() => setActiveTab('vendas')}
           style={{ padding: '15px 30px', border: 'none', background: 'none', fontWeight: 700, color: activeTab === 'vendas' ? '#ea1d2c' : '#888', borderBottom: activeTab === 'vendas' ? '4px solid #ea1d2c' : '4px solid transparent', cursor: 'pointer' }}
         >
           VENDAS
         </button>
         <button 
           onClick={() => setActiveTab('operacao')}
           style={{ padding: '15px 30px', border: 'none', background: 'none', fontWeight: 700, color: activeTab === 'operacao' ? '#ea1d2c' : '#888', borderBottom: activeTab === 'operacao' ? '4px solid #ea1d2c' : '4px solid transparent', cursor: 'pointer' }}
         >
           OPERAÇÃO
         </button>
         <button 
           onClick={() => setActiveTab('cardapio')}
           style={{ padding: '15px 30px', border: 'none', background: 'none', fontWeight: 700, color: activeTab === 'cardapio' ? '#ea1d2c' : '#888', borderBottom: activeTab === 'cardapio' ? '4px solid #ea1d2c' : '4px solid transparent', cursor: 'pointer' }}
         >
           CARDÁPIO
         </button>
         <button 
           onClick={() => setActiveTab('clientes')}
           style={{ padding: '15px 30px', border: 'none', background: 'none', fontWeight: 700, color: activeTab === 'clientes' ? '#ea1d2c' : '#888', borderBottom: activeTab === 'clientes' ? '4px solid #ea1d2c' : '4px solid transparent', cursor: 'pointer' }}
         >
           CLIENTES
         </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
         <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>VENDAS BRUTAS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '5px 0' }}>R$ 15.420,00</div>
            <div style={{ color: '#27ae60', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ArrowUpRight size={14}/> 12.5% em relação ao mês anterior
            </div>
         </div>
         <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>TICKET MÉDIO</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '5px 0' }}>R$ 42,50</div>
            <div style={{ color: '#e74c3c', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ArrowDownRight size={14}/> 2.1% hoje
            </div>
         </div>
         <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>TAXAS APP</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '5px 0' }}>R$ 2.100,00</div>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>Média de 14% por pedido</div>
         </div>
         <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>CANCELAMENTOS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '5px 0' }}>2.1%</div>
            <div style={{ fontSize: '0.75rem', color: '#27ae60' }}>Dentro da meta (abaixo de 3%)</div>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
         
         <div className="vini-glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
               <h3 style={{ margin: 0 }}>Evolução de Faturamento</h3>
               <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="vini-btn-outline" style={{ padding: '5px 15px', fontSize: '0.75rem' }}>DIA</button>
                  <button className="vini-btn-primary" style={{ padding: '5px 15px', fontSize: '0.75rem' }}>SEMANA</button>
               </div>
            </div>
            
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataVendas}>
                  <defs>
                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea1d2c" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ea1d2c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="vendas" stroke="#ea1d2c" strokeWidth={3} fillOpacity={1} fill="url(#colorVendas)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
               <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Top 5 Produtos</h3>
               {[1,2,3,4,5].map(i => (
                 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f9f9f9' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                       <span style={{ fontSize: '0.8rem', color: '#888' }}>{i}º</span>
                       <span style={{ fontWeight: 600 }}>Hot Dog do Vini Mestre</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#27ae60' }}>{150 - (i*20)} v.</span>
                 </div>
               ))}
            </div>

            <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
               <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Saúde da Operação</h3>
               <div style={{ display: 'grid', gap: '15px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                      <span>Tempo de preparo médio</span>
                      <strong>14 min</strong>
                    </div>
                    <div style={{ height: '8px', background: '#eee', borderRadius: '4px' }}>
                       <div style={{ height: '100%', width: '30%', background: '#27ae60', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px' }}>
                      <span>Tempo de entrega médio</span>
                      <strong>32 min</strong>
                    </div>
                    <div style={{ height: '8px', background: '#eee', borderRadius: '4px' }}>
                       <div style={{ height: '100%', width: '65%', background: '#f39c12', borderRadius: '4px' }}></div>
                    </div>
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}

export default DesempenhoVendas;
