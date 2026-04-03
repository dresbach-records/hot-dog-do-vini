import React from 'react';
import '../assets/styles/Dashboard.css';

function Cardapio() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Cardápio Digital</h2>
          <p>Gerencie produtos, categorias, variações e disponibilidade.</p>
        </div>
      </header>
      <div className="dashboard-content">
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <p>Módulo de Cardápio Digital em construção...</p>
        </div>
      </div>
    </div>
  );
}

export default Cardapio;
