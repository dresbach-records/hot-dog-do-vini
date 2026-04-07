import React from 'react';
import { ShieldCheck, Info, CheckCircle2, Clock } from 'lucide-react';
import '../styles/admin/dashboard.css';

function KYCStatus() {
  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
           <h2><ShieldCheck size={24} color="var(--c-green)" /> Situação da Conta (KYC)</h2>
           <p className="text-secondary">Explore seu status de aprovação e envio de documentos.</p>
        </div>
      </header>
      <div className="vini-glass-panel" style={{ padding: '3rem', borderLeft: '8px solid var(--c-green)' }}>
         <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <CheckCircle2 size={64} color="var(--c-green)" />
            <div>
               <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Conta Aprovada (Sandbox)</h3>
               <p style={{ color: 'var(--text-secondary)' }}>
                  Sua conta está enviando e recebendo pagamentos normalmente na rede de testes da Asaas.
               </p>
               <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                  <button className="vini-btn outline-primary">Ver Documentos</button>
                  <button className="vini-btn outline-secondary">Ajuda Asaas</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

export default KYCStatus;
