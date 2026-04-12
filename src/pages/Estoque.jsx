import React, { useState } from 'react';
import { 
  Package, ShoppingCart, TrendingDown, 
  Plus, Search, Filter, Download, Info,
  AlertCircle, ChefHat, BarChart, Settings
} from 'lucide-react';
import '../styles/admin/dashboard.css';

function Estoque() {
  const [activeTab, setActiveTab] = useState('inventario');
  const [insumos, setInsumos] = useState([
    { id: 1, nome: 'Pão de Hot Dog', categoria: 'Panificação', qtde: 150, uni: 'un', estoque_min: 50, custo_un: 0.85 },
    { id: 2, nome: 'Salsicha Perdigão', categoria: 'Frios', qtde: 42, uni: 'kg', estoque_min: 15, custo_un: 18.50 },
    { id: 3, nome: 'Batata Palha', categoria: 'Secos', qtde: 5, uni: 'pct', estoque_min: 10, custo_un: 12.00 },
    { id: 4, nome: 'Molho Especial Vini', categoria: 'Produzido', qtde: 12, uni: 'litros', estoque_min: 5, custo_un: 5.40 }
  ]);

  return (
    <div className="admin-page-container">
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
           <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Estoque</h1>
           <p style={{ opacity: 0.6 }}>Controle de insumos, fichas técnicas e custos de produção</p>
        </div>
        <div className="header-actions">
           <button className="vini-btn-outline"><Download size={18}/> EXPORTAR INVENTÁRIO</button>
           <button className="vini-btn-primary"><Plus size={18}/> ADICIONAR INSUMO</button>
        </div>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
         <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>VALOR EM ESTOQUE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '5px 0' }}>R$ 4.850,20</div>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>Custo total de compra</div>
         </div>
         <div className="vini-glass-panel" style={{ borderLeft: '4px solid #f1c40f', padding: '1.5rem' }}>
            <div style={{ color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>ALERTA DE REPOSIÇÃO</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '5px 0', color: '#f39c12' }}>8 itens</div>
            <div style={{ fontSize: '0.75rem', color: '#f39c12', fontWeight: 700 }}>Abaixo do estoque mínimo</div>
         </div>
         <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>GIRO MÉDIO</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '5px 0' }}>12 dias</div>
            <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.6 }}>Estoque atual dura 12 dias</p>
         </div>
         <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>DESPERDÍCIO (MÊS)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, margin: '5px 0', color: '#e74c3c' }}>1.2%</div>
            <div style={{ fontSize: '0.75rem', color: '#e74c3c', fontWeight: 700 }}>Meta: Abaixo de 2%</div>
         </div>
      </div>

      {/* Tabs Enterprise */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: '2rem' }}>
         <button onClick={() => setActiveTab('inventario')} style={{ padding: '15px 30px', border: 'none', background: 'none', fontWeight: 700, color: activeTab === 'inventario' ? '#ea1d2c' : '#888', borderBottom: activeTab === 'inventario' ? '3px solid #ea1d2c' : '3px solid transparent', cursor: 'pointer' }}>INVENTÁRIO</button>
         <button onClick={() => setActiveTab('ficha')} style={{ padding: '15px 30px', border: 'none', background: 'none', fontWeight: 700, color: activeTab === 'ficha' ? '#ea1d2c' : '#888', borderBottom: activeTab === 'ficha' ? '3px solid #ea1d2c' : '3px solid transparent', cursor: 'pointer' }}>FICHAS TÉCNICAS</button>
         <button onClick={() => setActiveTab('compras')} style={{ padding: '15px 30px', border: 'none', background: 'none', fontWeight: 700, color: activeTab === 'compras' ? '#ea1d2c' : '#888', borderBottom: activeTab === 'compras' ? '3px solid #ea1d2c' : '3px solid transparent', cursor: 'pointer' }}>ENTRADA/COMPRAS</button>
         <button onClick={() => setActiveTab('perdas')} style={{ padding: '15px 30px', border: 'none', background: 'none', fontWeight: 700, color: activeTab === 'perdas' ? '#ea1d2c' : '#888', borderBottom: activeTab === 'perdas' ? '3px solid #ea1d2c' : '3px solid transparent', cursor: 'pointer' }}>PERDAS/QUEBRAS</button>
      </div>

      <div className="vini-glass-panel" style={{ padding: '0' }}>
         <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="search-input-wrapper" style={{ width: '350px' }}>
              <Search size={18} color="#aaa" />
              <input type="text" placeholder="Filtrar por nome ou categoria..." />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
               <button className="vini-btn-outline" style={{ fontSize: '0.8rem' }}><Filter size={16}/> Filtros</button>
            </div>
         </div>

         <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
               <thead>
                  <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #eee', fontSize: '0.75rem', textTransform: 'uppercase', color: '#888' }}>
                     <th style={{ padding: '15px 2rem' }}>INSUMO</th>
                     <th>CATEGORIA</th>
                     <th>QUANTIDADE</th>
                     <th>VALOR UN.</th>
                     <th>VALOR TOTAL</th>
                     <th>STATUS</th>
                     <th style={{ padding: '15px 2rem' }}>AÇÕES</th>
                  </tr>
               </thead>
               <tbody>
                  {insumos.map(ins => (
                    <tr key={ins.id} style={{ borderBottom: '1px solid #f2f2f2' }}>
                       <td style={{ padding: '15px 2rem', fontWeight: 700 }}>{ins.nome}</td>
                       <td style={{ fontSize: '0.85rem' }}>{ins.categoria}</td>
                       <td style={{ fontWeight: 600 }}>{ins.qtde} {ins.uni}</td>
                       <td style={{ fontSize: '0.85rem', color: '#666' }}>R$ {ins.custo_un.toFixed(2)}</td>
                       <td style={{ fontWeight: 800 }}>R$ {(ins.custo_un * ins.qtde).toFixed(2)}</td>
                       <td>
                          {ins.qtde <= ins.estoque_min ? (
                             <span style={{ background: '#fff4e6', color: '#f39c12', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>REPOR URGENTE</span>
                          ) : (
                             <span style={{ background: '#e8f6ef', color: '#27ae60', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>ESTÁVEL</span>
                          )}
                       </td>
                       <td style={{ padding: '15px 2rem' }}>
                          <button className="btn-circle-outline"><Plus size={14}/></button>
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
