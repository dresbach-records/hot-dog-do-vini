import React from 'react';
import '../assets/styles/Dashboard.css';

function Relatorios() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Relatórios e Controle</h2>
          <p>Acompanhe o faturamento, ticket médio e produtos mais vendidos.</p>
        </div>
      </header>
      <div className="dashboard-content">
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <p>Módulo de Relatórios em construção...</p>
        </div>
      </div>
    </div>
  );
}

export default Relatorios;
