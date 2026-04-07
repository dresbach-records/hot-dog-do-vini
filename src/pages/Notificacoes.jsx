import React from 'react';
import { Bell, Mail, MessageSquare, Webhook, Settings } from 'lucide-react';
import '../styles/admin/dashboard.css';

function Notificacoes() {
  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
           <h2><Bell size={24} color="var(--c-yellow)" /> Sistema de Notificações (Module 14)</h2>
           <p className="text-secondary">Explore e gerencie alertas em tempo real e webhooks.</p>
        </div>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
         <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <h4 style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Mail size={18} /> E-mail</h4>
               <button className="vini-btn outline-secondary sm">Config.</button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avisar cliente sobre cobranças pendentes e notas emitidas.</p>
         </div>

         <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <h4 style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><MessageSquare size={18} /> WhatsApp</h4>
               <button className="vini-btn outline-secondary sm">Config.</button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Integração direta com o ViniBot para lembretes de Pix.</p>
         </div>

         <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <h4 style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><Webhook size={18} /> Webhook</h4>
               <button className="vini-btn outline-primary sm">Ativo</button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Recebendo eventos de: https://webhook.hotdogdovini.com.br</p>
         </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
         <h3>Log de Notificações Recentes</h3>
         <div className="vini-glass-panel" style={{ padding: '2rem', textAlign: 'center', opacity: 0.6 }}>
            <p>Nenhuma notificação disparada recentemente.</p>
         </div>
      </div>
    </div>
  );
}

export default Notificacoes;
