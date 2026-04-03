import React from 'react';
import '../assets/styles/Dashboard.css';

function Entregas() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Gestão de Entregas</h2>
          <p>Controle de entregadores, taxas e tempo estimado.</p>
        </div>
      </header>
      <div className="dashboard-content">
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <p>Módulo de Entregas em construção...</p>
        </div>
      </div>
    </div>
  );
}

export default Entregas;
