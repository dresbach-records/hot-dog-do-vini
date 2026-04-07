import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import '../styles/admin/dashboard.css';

function FinancasHub() {
  const [stats, setStats] = useState({
     balance: 0,
     pending: 0,
     overdue: 0,
     received: 0,
     chargeback: 0
  });
  const [loading, setLoading] = useState(true);

  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
     async function loadStats() {
        if (isFetching) return;
        setIsFetching(true);
        try {
           const res = await api.get('/payments/balance');
           const transRes = await api.get('/payments/transactions');
           
           if (res.success) setStats(prev => ({ ...prev, balance: res.balance.balance }));
           
           if (transRes.success) {
              const txs = transRes.transactions;
              const pending = txs.filter(t => t.payments?.status === 'PENDING' || t.payments?.status === 'PAYMENT_CREATED').reduce((acc, t) => acc + (t.amount || 0), 0);
              const chargeback = txs.filter(t => t.category === 'CHARGEBACK').reduce((acc, t) => acc + (t.amount || 0), 0);
              const overdue = txs.filter(t => t.payments?.status === 'OVERDUE').reduce((acc, t) => acc + (t.amount || 0), 0);
              setStats(prev => ({ ...prev, pending, chargeback, overdue }));
           }
        } catch (err) { console.error(err); }
        finally { 
           setLoading(false); 
           setIsFetching(false);
        }
     }
     
     loadStats();
     const interval = setInterval(loadStats, 30000); // 30s refresh
     return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
           <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BarChart3 color="var(--c-green)" /> Dashboard Financeiro ERP
           </h2>
           <p className="text-secondary">Visão consolidada de fluxos, chargebacks e liquidez Asaas.</p>
        </div>
      </header>

      <section className="stats-grid" style={{ marginBottom: '2.5rem' }}>
         <div className="vini-card-stat vini-glass-panel" style={{ borderLeft: '4px solid var(--c-green)' }}>
            <div className="stat-info">
               <span className="stat-label">Saldo Disponível (Cash)</span>
               <h3 className="stat-value">R$ {parseFloat(stats.balance).toFixed(2)}</h3>
               <span className="stat-trend positive">Pronto para transferência</span>
            </div>
         </div>
         <div className="vini-card-stat vini-glass-panel">
            <div className="stat-info">
               <span className="stat-label">A Receber (Pendentes)</span>
               <h3 className="stat-value">R$ {parseFloat(stats.pending).toFixed(2)}</h3>
               <span className="stat-trend neutral">Previsão de entrada</span>
            </div>
         </div>
         <div className="vini-card-stat vini-glass-panel" style={{ borderLeft: '4px solid var(--c-red)' }}>
            <div className="stat-info">
               <span className="stat-label">Vencidos (Overdue)</span>
               <h3 className="stat-value text-negative">R$ {parseFloat(stats.overdue).toFixed(2)}</h3>
               <span className="stat-trend negative">Risco de inadimplência</span>
            </div>
         </div>
         <div className="vini-card-stat vini-glass-panel">
            <div className="stat-info">
               <span className="stat-label">Chargebacks / Disputas</span>
               <h3 className="stat-value text-negative">R$ {parseFloat(stats.chargeback).toFixed(2)}</h3>
               <span className="stat-trend negative">Requer atenção imediata</span>
            </div>
         </div>
      </section>

      <div className="vini-glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
         <TrendingUp size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
         <h3>Gráficos de Evolução Financeira em tempo real sendo populados...</h3>
         <p>Conectando com o módulo de Webhooks do Asaas para gerar o BI local.</p>
      </div>
    </div>
  );
}

export default FinancasHub;
