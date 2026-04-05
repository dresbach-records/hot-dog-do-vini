import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  RefreshCw, 
  TrendingUp, 
  ShoppingCart, 
  ArrowDown, 
  ArrowUp,
  Search,
  Settings
} from 'lucide-react';

function Estoque() {
  const [insumos, setInsumos] = useState([
    { id: 1, nome: 'Pão de Hot Dog', categoria: 'Panificação', qtd: 145, min: 50, uni: 'UN', custo: 0.85 },
    { id: 2, nome: 'Salsicha Perdigão', categoria: 'Carnes', qtd: 12, min: 20, uni: 'KG', custo: 18.90 },
    { id: 3, nome: 'Batata Palha 1kg', categoria: 'Secos', qtd: 8, min: 5, uni: 'PCT', custo: 22.50 },
    { id: 4, nome: 'Maionese Caseira 5L', categoria: 'Molhos', qtd: 2, min: 1, uni: 'BAL', custo: 65.00 },
    { id: 5, nome: 'Embalagem Vini', categoria: 'Descartáveis', qtd: 450, min: 100, uni: 'UN', custo: 0.35 }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filtered = insumos.filter(i => i.nome.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalEmEstoque = insumos.reduce((acc, curr) => acc + (curr.qtd * curr.custo), 0);

  return (
    <div className="dashboard animate-fade-in" style={{ padding: '1.5rem', background: 'var(--bg-base)' }}>
      <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={28} color="var(--c-red)" /> Gestão de Estoque
          </h2>
          <p className="text-secondary">Controle de insumos e alerta de reposição de mercadorias.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="vini-btn-outline"><RefreshCw size={18} /> Sincronizar</button>
          <button className="btn vini-btn-primary"><Plus size={18} /> Adicionar Insumo</button>
        </div>
      </header>

      {/* KPI CARDS ESTOQUE */}
      <div className="stats-grid" style={{ marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        
        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <TrendingUp size={24} color="#3b82f6" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Valor em Estoque</span>
            <h3 className="stat-value">R$ {totalEmEstoque.toFixed(2).replace('.', ',')}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Investimento atual</span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <AlertTriangle size={24} color="var(--c-red)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Itens Críticos</span>
            <h3 className="stat-value" style={{ color: 'var(--c-red)' }}>{insumos.filter(i => i.qtd <= i.min).length}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--c-red)', fontWeight: '700' }}>Reposição Necessária!</span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper" style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
            <ShoppingCart size={24} color="#22c55e" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total de Itens</span>
            <h3 className="stat-value">{insumos.length}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Produtos cadastrados</span>
          </div>
        </div>
      </div>

      {/* TABELA DE INSUMOS */}
      <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
           <h3 style={{ margin: 0 }}>Listagem de Insumos</h3>
           <div className="search-box" style={{ position: 'relative', width: '300px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Buscar insumo..." 
                className="vini-input-dark" 
                style={{ width: '100%', paddingLeft: '40px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item / Categoria</th>
                <th>Qtd Atual</th>
                <th>Estoque Min.</th>
                <th>Custo Unit.</th>
                <th>Total</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontWeight: '700' }}>{item.nome}</span>
                       <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.categoria}</span>
                    </div>
                  </td>
                  <td><strong style={{ fontSize: '1.1rem' }}>{item.qtd} {item.uni}</strong></td>
                  <td>{item.min} {item.uni}</td>
                  <td>R$ {item.custo.toFixed(2)}</td>
                  <td style={{ fontWeight: '700' }}>R$ {(item.qtd * item.custo).toFixed(2)}</td>
                  <td>
                    <span className={`vini-badge ${item.qtd <= item.min ? 'warning' : 'success'}`}>
                      {item.qtd <= item.min ? 'CRÍTICO' : 'NORMAL'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                       <button className="vini-btn-action" title="Entrada"><ArrowUp size={14} /></button>
                       <button className="vini-btn-action secondary" title="Saída"><ArrowDown size={14} /></button>
                       <button className="vini-btn-action secondary" title="Configurar"><Settings size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Estoque;
