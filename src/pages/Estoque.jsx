import React, { useState, useEffect } from 'react';
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
  Settings,
  X
} from 'lucide-react';
import { estoque } from '../services/api';
import '../styles/admin/dashboard.css';

function Estoque() {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newInsumo, setNewInsumo] = useState({ nome: '', categoria: '', quantidade: 0, minimo: 0, unidade: 'UN', custo_unitario: 0 });

  useEffect(() => {
    fetchInsumos();
  }, []);

  const fetchInsumos = async () => {
    setLoading(true);
    try {
      const resp = await estoque.listInsumos();
      if (resp.success) setInsumos(resp.data);
    } catch (err) {
      console.error('Erro ao buscar estoque:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const resp = await estoque.createInsumo(newInsumo);
      if (resp.success) {
        setShowModal(false);
        setNewInsumo({ nome: '', categoria: '', quantidade: 0, minimo: 0, unidade: 'UN', custo_unitario: 0 });
        fetchInsumos();
      }
    } catch (err) {
      alert('Erro ao cadastrar insumo');
    }
  };

  const handleMovimentacao = async (id, qtd, motivo) => {
    const valorStr = window.prompt(`Quantidade para ${qtd > 0 ? 'Entrada (+)' : 'Saída (-)'}:`, '1');
    if (!valorStr) return;
    const valor = parseFloat(valorStr) * (qtd > 0 ? 1 : -1);
    
    try {
      const resp = await estoque.movimentar(id, valor, motivo || 'Ajuste manual');
      if (resp.success) fetchInsumos();
    } catch (err) {
      alert('Erro na movimentação');
    }
  };

  const filtered = insumos.filter(i => i.nome.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalEmEstoque = insumos.reduce((acc, curr) => acc + (Number(curr.quantidade) * Number(curr.custo_unitario)), 0);
  const itensCriticos = insumos.filter(i => Number(i.quantidade) <= Number(i.minimo));

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
          <button className="vini-btn-outline" onClick={fetchInsumos}><RefreshCw size={18} /> Sincronizar</button>
          <button className="btn vini-btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Adicionar Insumo</button>
        </div>
      </header>

      {/* KPI CARDS ESTOQUE */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper blue">
            <TrendingUp size={24} color="#3b82f6" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Valor em Estoque</span>
            <h3 className="stat-value">R$ {totalEmEstoque.toFixed(2).replace('.', ',')}</h3>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem', border: itensCriticos.length > 0 ? '1px solid rgba(239, 68, 68, 0.2)' : 'none' }}>
          <div className="stat-icon-wrapper red">
            <AlertTriangle size={24} color="var(--c-red)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Itens Críticos</span>
            <h3 className="stat-value" style={{ color: 'var(--c-red)' }}>{itensCriticos.length}</h3>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper green">
            <ShoppingCart size={24} color="#22c55e" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total de Itens</span>
            <h3 className="stat-value">{insumos.length}</h3>
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
                  <td><strong style={{ fontSize: '1.1rem' }}>{Number(item.quantidade)} {item.unidade}</strong></td>
                  <td>{Number(item.minimo)} {item.unidade}</td>
                  <td>R$ {Number(item.custo_unitario).toFixed(2)}</td>
                  <td style={{ fontWeight: '700' }}>R$ {(item.quantidade * item.custo_unitario).toFixed(2)}</td>
                  <td>
                    <span className={`vini-badge ${Number(item.quantidade) <= Number(item.minimo) ? 'warning' : 'success'}`}>
                      {Number(item.quantidade) <= Number(item.minimo) ? 'CRÍTICO' : 'NORMAL'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                       <button onClick={() => handleMovimentacao(item.id, 1, 'Entrada manual')} className="vini-btn-action" title="Entrada"><ArrowUp size={14} /></button>
                       <button onClick={() => handleMovimentacao(item.id, -1, 'Saída manual')} className="vini-btn-action secondary" title="Saída"><ArrowDown size={14} /></button>
                       <button className="vini-btn-action secondary" title="Configurar"><Settings size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Nenhum insumo encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ADICIONAR INSUMO */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="vini-glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
            <h3>Novo Insumo</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
               <input type="text" placeholder="Nome do Insumo (ex: Salsicha)" className="vini-input-dark" required value={newInsumo.nome} onChange={e => setNewInsumo({...newInsumo, nome: e.target.value})} />
               <input type="text" placeholder="Categoria (ex: Frios)" className="vini-input-dark" required value={newInsumo.categoria} onChange={e => setNewInsumo({...newInsumo, categoria: e.target.value})} />
               <div style={{ display: 'flex', gap: '1rem' }}>
                 <input type="number" placeholder="Qtd Inicial" className="vini-input-dark" style={{ flex: 1 }} required value={newInsumo.quantidade} onChange={e => setNewInsumo({...newInsumo, quantidade: e.target.value})} />
                 <input type="text" placeholder="Unidade (KG, UN)" className="vini-input-dark" style={{ flex: 1 }} required value={newInsumo.unidade} onChange={e => setNewInsumo({...newInsumo, unidade: e.target.value})} />
               </div>
               <div style={{ display: 'flex', gap: '1rem' }}>
                 <input type="number" placeholder="Estoque Mín" className="vini-input-dark" style={{ flex: 1 }} required value={newInsumo.minimo} onChange={e => setNewInsumo({...newInsumo, minimo: e.target.value})} />
                 <input type="number" step="0.01" placeholder="Custo Unit" className="vini-input-dark" style={{ flex: 1 }} required value={newInsumo.custo_unitario} onChange={e => setNewInsumo({...newInsumo, custo_unitario: e.target.value})} />
               </div>
               <button type="submit" className="vini-btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>Salvar no Estoque</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Estoque;
