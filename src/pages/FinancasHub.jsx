import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  DollarSign, TrendingUp, Calendar, ArrowUpRight, 
  ArrowDownRight, FileText, Download, PieChart, 
  CreditCard, Wallet, Banknote, HelpCircle, 
  Info, ChevronRight, List, ExternalLink, RefreshCcw,
  AlertTriangle, Landmark, ShieldCheck, Receipt
} from 'lucide-react';
import '../styles/admin/dashboard.css';

/**
 * FinancasHub Enterprise — Powered by Pagar.me v5
 * Gerenciamento financeiro industrial centralizado.
 */
function FinancasHub() {
  const [activeModule, setActiveModule] = useState('resumo');
  const [balance, setBalance] = useState({ available: 0, pending: 0, total: 0 });
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);

  const modules = [
    { id: 'resumo', label: 'Resumo', icon: <PieChart size={18}/> },
    { id: 'vendas', label: 'Vendas', icon: <TrendingUp size={18}/> },
    { id: 'pedidos', label: 'Pedidos', icon: <List size={18}/> },
    { id: 'cobrancas', label: 'Cobranças', icon: <CreditCard size={18}/> },
    { id: 'links', label: 'Links de Pagamento', icon: <ExternalLink size={18}/> },
    { id: 'contestacoes', label: 'Contestações', icon: <ShieldCheck size={18}/> },
    { id: 'financeiro', label: 'Financeiro', icon: <Banknote size={18}/> },
    { id: 'extrato', label: 'Extrato', icon: <FileText size={18}/> },
    { id: 'transferencias', label: 'Transferências', icon: <Landmark size={18}/> },
    { id: 'antecipacoes', label: 'Antecipações', icon: <RefreshCcw size={18}/> },
    { id: 'liquidacoes', label: 'Liquidações', icon: <CheckCircleIcon size={18}/> }, // Usando Chevron como placeholder se não houver icon
    { id: 'informe', label: 'Informe de Rendimentos', icon: <Receipt size={18}/> },
  ];

  const fetchBalance = async () => {
    try {
      const resp = await api.get('/pagarme/balance');
      if (resp?.success) {
        setBalance({
          available: (resp.data.available?.[0]?.amount || 0) / 100,
          pending: (resp.data.waiting_funds?.[0]?.amount || 0) / 100,
          total: (resp.data.available?.[0]?.amount + resp.data.waiting_funds?.[0]?.amount) / 100
        });
      }
    } catch (e) {
      console.error('Erro ao buscar saldo Pagar.me');
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'resumo':
        return (
          <div className="finance-resumo-view">
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="vini-glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #27ae60' }}>
                   <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '8px' }}>SALDO DISPONÍVEL</div>
                   <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>R$ {balance.available.toFixed(2)}</div>
                </div>
                <div className="vini-glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #f39c12' }}>
                   <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '8px' }}>A RECEBER (PREVISTO)</div>
                   <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>R$ {balance.pending.toFixed(2)}</div>
                </div>
                <div className="vini-glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #ea1d2c' }}>
                   <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '8px' }}>TOTAL BRUTO</div>
                   <div style={{ fontSize: '1.8rem', fontWeight: 900 }}>R$ {balance.total.toFixed(2)}</div>
                </div>
             </div>
             
             <div className="vini-glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <HelpCircle size={48} opacity={0.2} style={{ marginBottom: '1rem' }} />
                <h3>Selecione um módulo na lateral para detalhamento</h3>
                <p style={{ opacity: 0.6 }}>Gerencie vendas, extratos e antecipações de forma automatizada via Pagar.me v5.</p>
             </div>
          </div>
        );
      default:
        return (
          <div className="vini-glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
             <LandingIcon size={48} opacity={0.2} style={{ marginBottom: '1rem' }} />
             <h3>Módulo em Integração Final</h3>
             <p style={{ opacity: 0.6 }}>O módulo {activeModule.toUpperCase()} está sendo conectado à API do Pagar.me.</p>
             <button className="vini-btn-outline" onClick={() => setActiveModule('resumo')}>Voltar ao Resumo</button>
          </div>
        );
    }
  };

  return (
    <div className="admin-page-container" style={{ display: 'flex', gap: '2rem', padding: '0' }}>
      
      {/* Sidebar Financeira Lateral */}
      <aside className="finance-sidebar" style={{ 
        width: '280px', 
        background: '#fff', 
        height: 'calc(100vh - 80px)', 
        borderRight: '1px solid #ddd',
        padding: '1.5rem 0'
      }}>
        <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #eee' }}>
           <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>FINANCEIRO HUB</h2>
           <span style={{ fontSize: '10px', fontWeight: 900, color: '#ea1d2c' }}>PAGAR.ME V5 INDUSTRIAL</span>
        </div>
        
        <nav style={{ padding: '1rem' }}>
           {modules.map(mod => (
             <button 
               key={mod.id} 
               onClick={() => setActiveModule(mod.id)}
               className={`finance-nav-btn ${activeModule === mod.id ? 'active' : ''}`}
               style={{
                 width: '100%',
                 display: 'flex',
                 alignItems: 'center',
                 gap: '12px',
                 padding: '12px 1rem',
                 border: 'none',
                 background: activeModule === mod.id ? '#fef2f2' : 'none',
                 color: activeModule === mod.id ? '#ea1d2c' : '#555',
                 borderRadius: '8px',
                 cursor: 'pointer',
                 fontWeight: activeModule === mod.id ? 700 : 500,
                 margin: '4px 0',
                 textAlign: 'left',
                 transition: 'all 0.2s'
               }}
             >
                {mod.icon}
                <span style={{ fontSize: '0.85rem' }}>{mod.label}</span>
             </button>
           ))}
        </nav>
      </aside>

      {/* Área de Conteúdo Principal */}
      <main style={{ flex: 1, padding: '2rem' }}>
        <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
           <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>{modules.find(m => m.id === activeModule)?.label}</h1>
              <p style={{ opacity: 0.6 }}>Monitoramento em tempo real do ecossistema financeiro</p>
           </div>
           <div style={{ display: 'flex', gap: '10px' }}>
              <button className="vini-btn-outline"><Calendar size={18}/> FILTRAR</button>
              <button className="vini-btn-primary"><Download size={18}/> EXPORTAR</button>
           </div>
        </header>

        {renderModuleContent()}
      </main>

    </div>
  );
}

// Helper icon placeholder
function CheckCircleIcon({ size }) { return <ChevronRight size={size}/> }
function LandingIcon({ size }) { return <Landmark size={size}/> }

export default FinancasHub;
