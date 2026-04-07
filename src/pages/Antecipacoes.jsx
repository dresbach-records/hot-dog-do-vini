import React from 'react';
import { History, TrendingUp, AlertCircle } from 'lucide-react';
import '../styles/admin/dashboard.css';

function Antecipacoes() {
  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
           <h2><History size={24} /> Antecipações (Module 5)</h2>
           <p className="text-secondary">Verifique antecipações disponíveis na sua conta.</p>
        </div>
      </header>
      <div className="vini-glass-panel" style={{ padding: '3rem', textAlign: 'center', opacity: 0.7 }}>
         <TrendingUp size={48} style={{ marginBottom: '1rem', color: 'var(--c-green)' }} />
         <h3>Carregando antecipações da API asaas v3...</h3>
         <p>Você verá aqui quanto pode antecipar hoje.</p>
      </div>
    </div>
  );
}

export default Antecipacoes;
