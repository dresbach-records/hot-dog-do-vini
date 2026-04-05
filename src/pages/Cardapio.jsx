import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/admin/dashboard.css';
import { Plus, CloudDownload, Search, Filter } from 'lucide-react';

// Componentes Modulares
import CategoriaList from '../components/cardapio/categoria-list/CategoriaList';
import ProdutoCard from '../components/cardapio/produto-card/ProdutoCard';
import ImportIfood from '../components/cardapio/importacao/import-ifood/ImportIfood';
import Button from '../components/ui/Button';

function Cardapio() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [activeCategoriaId, setActiveCategoriaId] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    setLoading(true);
    try {
      const { data: cats } = await supabase.from('categorias').select('*').order('ordem');
      const { data: prods } = await supabase.from('produtos').select('*').order('titulo');
      
      setCategorias(cats || []);
      setProdutos(prods || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDisponibilidade = async (produto) => {
    const { error } = await supabase
      .from('produtos')
      .update({ disponivel: !produto.disponivel })
      .eq('id', produto.id);

    if (!error) {
      setProdutos(prev => prev.map(p => p.id === produto.id ? { ...p, disponivel: !p.disponivel } : p));
    }
  };

  const handleDeleteCategoria = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria? Todos os produtos vinculados serão afetados.')) return;
    
    const { error } = await supabase.from('categorias').delete().eq('id', id);
    if (!error) fetchDados();
  };

  const filteredProdutos = produtos.filter(p => {
    const matchCat = activeCategoriaId ? p.categoria_id === activeCategoriaId : true;
    const matchSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="dashboard admin-container">
      <header className="dashboard-header">
        <div className="header-info">
          <h2>Cardápio Digital</h2>
          <p>Gerencie produtos, categorias e integrações.</p>
        </div>
        <div className="header-actions">
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <CloudDownload size={18} /> Importar iFood
          </Button>
          <Button onClick={() => alert('Novo Produto')}>
            <Plus size={18} /> Novo Produto
          </Button>
        </div>
      </header>

      <div className="dashboard-content cardapio-layout">
        {/* Sidebar de Categorias */}
        <CategoriaList 
          categorias={categorias} 
          activeId={activeCategoriaId}
          onSelect={setActiveCategoriaId}
          onDelete={handleDeleteCategoria}
        />

        {/* Listagem de Produtos */}
        <div className="produtos-main">
          <div className="produtos-toolbar">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Buscar no cardápio..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-badge">
              <Filter size={14} /> {filteredProdutos.length} Itens encontrados
            </div>
          </div>

          {loading ? (
            <div className="vini-loading">Carregando cardápio...</div>
          ) : (
            <div className="produtos-grid">
              {filteredProdutos.map(produto => (
                <ProdutoCard 
                  key={produto.id} 
                  produto={produto} 
                  onEdit={(p) => alert('Editar: ' + p.titulo)}
                  onToggle={handleToggleDisponibilidade}
                />
              ))}
              {filteredProdutos.length === 0 && (
                <div className="empty-state">
                  <p>Nenhum produto encontrado nesta categoria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Importação */}
      <ImportIfood 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={fetchDados}
      />

      <style jsx>{`
        .cardapio-layout {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
          padding: 2rem;
        }

        .produtos-main {
          flex: 1;
        }

        .produtos-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .search-box {
          flex: 1;
          max-width: 400px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .search-box input {
          width: 100%;
          padding: 10px 15px 10px 40px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: #fff;
        }

        .filter-badge {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .produtos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 50px;
          background: #f9fafb;
          border-radius: var(--radius-lg);
          color: #999;
          border: 2px dashed #eee;
        }

        .vini-loading {
          text-align: center;
          padding: 40px;
          color: var(--c-red);
          font-weight: 700;
        }

        @media (max-width: 1024px) {
          .cardapio-layout {
            flex-direction: column;
          }
          .vini-categoria-sidebar {
            width: 100%;
            position: static;
          }
        }
      `}</style>
    </div>
  );
}

export default Cardapio;
