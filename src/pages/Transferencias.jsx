import React from 'react';
import { ArrowRightLeft, Plus } from 'lucide-react';
import '../styles/admin/dashboard.css';

function Transferencias() {
  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem' }}>
      <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
           <h2><ArrowRightLeft size={24} /> Transferências Bancárias</h2>
           <p className="text-secondary">Envie saldo do Asaas para suas contas externas.</p>
        </div>
        <button className="vini-btn success"><Plus size={18} /> Nova Transferência</button>
      </header>
      <div className="vini-glass-panel" style={{ padding: '3rem', textAlign: 'center', opacity: 0.7 }}>
         <ArrowRightLeft size={48} style={{ marginBottom: '1rem', color: 'var(--c-blue)' }} />
         <h3>Nenhuma transferência pendente.</h3>
         <p>Module 3: Bank transfers history and management.</p>
      </div>
    </div>
  );
}

export default Transferencias;
