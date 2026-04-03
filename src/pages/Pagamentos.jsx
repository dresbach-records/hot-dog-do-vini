import React from 'react';
import '../assets/styles/Dashboard.css';

function Pagamentos() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Pagamentos Online</h2>
          <p>Configuração e conciliação de pagamentos online e gateways.</p>
        </div>
      </header>
      <div className="dashboard-content">
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <p>Módulo de Pagamentos em construção...</p>
        </div>
      </div>
    </div>
  );
}

export default Pagamentos;
