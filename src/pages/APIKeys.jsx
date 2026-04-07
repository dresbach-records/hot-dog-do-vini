import React from 'react';
import { Key, Eye, EyeOff, RotateCcw, Copy, AlertTriangle } from 'lucide-react';
import '../styles/admin/dashboard.css';

function APIKeys() {
  const [showKey, setShowKey] = React.useState(false);

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
           <h2><Key size={24} /> Chaves de API (Segurança)</h2>
           <p className="text-secondary">Gerencie suas chaves de acesso para integrações externas.</p>
        </div>
      </header>
      <div className="vini-glass-panel" style={{ padding: '2rem', border: '1px solid var(--c-yellow)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(234, 179, 8, 0.1)', padding: '1rem', borderRadius: '8px' }}>
            <AlertTriangle color="var(--c-yellow)" />
            <p style={{ fontSize: '0.9rem' }}>Nunca compartilhe sua chave privada. Ela concede acesso TOTAL à sua conta Asaas.</p>
         </div>
         <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Sandbox API Key</label>
            <div style={{ display: 'flex', gap: '10px' }}>
               <input 
                  type={showKey ? 'text' : 'password'} 
                  readOnly 
                  value="$a9eb789c-369f-4b0c-9111-53134c42cda0" 
                  style={{ flex: 1, padding: '12px', background: 'var(--bg-active)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'monospace' }}
               />
               <button className="vini-btn outline-secondary" onClick={() => setShowKey(!showKey)}>
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
               </button>
               <button className="vini-btn outline-secondary"><Copy size={18} /></button>
            </div>
         </div>
         <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="vini-btn outline-danger"><RotateCcw size={18} /> Revogar Chave</button>
            <button className="vini-btn success">Gerar Nova Chave</button>
         </div>
      </div>
    </div>
  );
}

export default APIKeys;
