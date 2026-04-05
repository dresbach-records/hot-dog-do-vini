import React, { useState } from 'react';
import '../styles/admin/dashboard.css';

function Integracoes() {
  const [ifoodActive, setIfoodActive] = useState(false);
  const [anotaAiActive, setAnotaAiActive] = useState(true);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Integrações</h2>
          <p>Gerencie as conexões do Vini's com outras plataformas de venda e operação.</p>
        </div>
      </header>
      
      <div className="metrics-grid" style={{ marginTop: '2rem' }}>
        {/* IFood Integration Card */}
        <div className="metric-card vini-glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--c-red)' }}>iFood</h3>
            <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
              <input 
                type="checkbox" 
                checked={ifoodActive} 
                onChange={() => setIfoodActive(!ifoodActive)} 
                style={{ opacity: 0, width: 0, height: 0 }} 
              />
              <span className="slider" style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: ifoodActive ? 'var(--c-red)' : '#ccc', borderRadius: '34px', transition: '.4s'
              }}>
                <span style={{
                  position: 'absolute', content: '""', height: '14px', width: '14px', left: '3px', bottom: '3px',
                  backgroundColor: 'white', borderRadius: '50%', transition: '.4s',
                  transform: ifoodActive ? 'translateX(20px)' : 'none'
                }}></span>
              </span>
            </label>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Receba pedidos do iFood diretamente no painel do Vini's. Sincronize cardápio e status de entrega.
          </p>
          <button className="btn vini-btn-primary" style={{ marginTop: 'auto', alignSelf: 'flex-start' }} disabled={!ifoodActive}>
            Configurar Credenciais
          </button>
        </div>

        {/* Anota AI Integration Card */}
        <div className="metric-card vini-glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#00d1b2' }}>Anota AI</h3>
            <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
              <input 
                type="checkbox" 
                checked={anotaAiActive} 
                onChange={() => setAnotaAiActive(!anotaAiActive)} 
                style={{ opacity: 0, width: 0, height: 0 }} 
              />
              <span className="slider" style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: anotaAiActive ? '#00d1b2' : '#ccc', borderRadius: '34px', transition: '.4s'
              }}>
                <span style={{
                  position: 'absolute', content: '""', height: '14px', width: '14px', left: '3px', bottom: '3px',
                  backgroundColor: 'white', borderRadius: '50%', transition: '.4s',
                  transform: anotaAiActive ? 'translateX(20px)' : 'none'
                }}></span>
              </span>
            </label>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Atendente virtual via WhatsApp. Integre os pedidos do robô direto na sua tela de gestão.
          </p>
          <button className="btn vini-btn-primary" style={{ marginTop: 'auto', alignSelf: 'flex-start' }} disabled={!anotaAiActive}>
            Sincronizar Catálogo
          </button>
        </div>

        {/* Impressora Integration Card */}
        <div className="metric-card vini-glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Impressora Térmica</h3>
            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>Local</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Impressão automática de vias para a cozinha e para o motoboy na finalização do pedido.
          </p>
          <button className="btn" style={{ marginTop: 'auto', alignSelf: 'flex-start', background: 'var(--bg-surface-elevated)' }}>
            Testar Impressão
          </button>
        </div>
      </div>
    </div>
  );
}

export default Integracoes;
