import React from 'react';
import { CalendarClock, PlusCircle, AlertCircle } from 'lucide-react';
import '../styles/admin/dashboard.css';

function Assinaturas() {
  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem' }}>
      <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
           <h2><CalendarClock size={24} /> Assinaturas & Recorrência</h2>
           <p className="text-secondary">Gestão de planos corporativos e mensalidades.</p>
        </div>
        <button className="vini-btn success"><PlusCircle size={18} /> Novo Plano</button>
      </header>
      <div className="vini-glass-panel" style={{ padding: '3rem', textAlign: 'center', opacity: 0.7 }}>
         <CalendarClock size={48} style={{ marginBottom: '1rem' }} />
         <h3>Nenhuma assinatura ativa.</h3>
         <p>Module 7: Subscriptions ready for configuration.</p>
      </div>
    </div>
  );
}

export default Assinaturas;
