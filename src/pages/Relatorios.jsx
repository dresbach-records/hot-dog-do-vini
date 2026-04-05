import React from 'react';
import '../styles/admin/dashboard.css';

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
        <div className="vini-glass-panel" style={{ padding: '2rem' }}>
          <p>Módulo de Relatórios em construção...</p>
        </div>
      </div>
    </div>
  );
}

export default Relatorios;
