import React from 'react';
import '../assets/styles/Dashboard.css';

function Marketing() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Marketing e Vendas</h2>
          <p>Configuração de cupons, promoções e combos.</p>
        </div>
      </header>
      <div className="dashboard-content">
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <p>Módulo de Marketing em construção...</p>
        </div>
      </div>
    </div>
  );
}

export default Marketing;
