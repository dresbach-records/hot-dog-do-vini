import React, { useState, useEffect } from 'react';
import { products, categories } from '../services/api';
import '../styles/admin/dashboard.css';
import { Plus, CloudDownload, Search, Filter, RefreshCw } from 'lucide-react';

// Componentes Modulares
import CategoriaList from '../components/cardapio/categoria-list/CategoriaList';
import ProdutoCard from '../components/cardapio/produto-card/ProdutoCard';
import ImportIfood from '../components/cardapio/importacao/import-ifood/ImportIfood';
import ProdutoModal from '../components/cardapio/produto-modal/ProdutoModal';
import Button from '../components/ui/Button';

function Cardapio() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [activeCategoriaId, setActiveCategoriaId] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isProdutoModalOpen, setIsProdutoModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchDados();
  }, []);

  // 🖱️ LÓGICA DE SCANNER (USB HID / KEYBOARD EMULATION)
  useEffect(() => {
    let barcodeString = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      // Ignora se estiver digitando em outros inputs normais (descrição, preço, etc)
      if (e.target.tagName === 'INPUT' && e.target.name !== 'barcode' && e.target.name !== 'search') return;
      if (e.target.tagName === 'TEXTAREA') return;

      const currentTime = Date.now();
      
      // Scanners reais enviam as teclas muito rápido (< 50ms)
      if (currentTime - lastKeyTime > 100) {
        barcodeString = '';
      }

      if (e.key === 'Enter') {
        if (barcodeString.length > 3) {
          processBarcode(barcodeString);
          barcodeString = '';
        }
      } else if (e.key.length === 1 && /[0-9]/.test(e.key)) {
        barcodeString += e.key;
      }

      lastKeyTime = currentTime;
    };

    const processBarcode = (code) => {
      console.log('🔍 Barcode detectado:', code);
      // Busca produto localmente
      const found = produtos.find(p => p.barcode === code);
      
      if (found) {
         setEditingProduto(found);
         setIsProdutoModalOpen(true);
      } else {
         // Se for novo, abre o modal para criar
         setEditingProduto({ barcode: code, titulo: '', preco: '', categoria_id: activeCategoriaId });
         setIsProdutoModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [produtos, activeCategoriaId]);

  const fetchDados = async () => {
    setLoading(true);
    try {
      const catsRes = await categories.list();
      const prodsRes = await products.list();
      
      if (catsRes.success) setCategorias(catsRes.data || []);
      if (prodsRes.success) setProdutos(prodsRes.data || []);
      
      if (catsRes.data?.length > 0 && !activeCategoriaId) {
        setActiveCategoriaId(catsRes.data[0].id);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduto = async (produtoData) => {
    try {
      const isNew = !produtoData.id || (typeof produtoData.id === 'string' && produtoData.id.startsWith('p_'));
      
      const payload = {
        titulo: produtoData.titulo,
        descricao: produtoData.descricao,
        preco: Number(produtoData.preco),
        categoria_id: produtoData.categoria_id,
        imagem_url: produtoData.imagem_url,
        disponivel: produtoData.disponivel,
        ncm: produtoData.ncm,
        barcode: produtoData.barcode
      };

      let response;
      if (isNew) {
        response = await products.create(payload);
      } else {
        response = await products.update(produtoData.id, payload);
      }

      if (!response.success) throw new Error(response.error);
      
      setIsProdutoModalOpen(false);
      setEditingProduto(null);
      fetchDados();
      return response; // Retorna para o modal poder usar o ID se for novo
    } catch (err) {
      alert('Erro ao salvar produto: ' + err);
      return { success: false, error: err };
    }
  };

  const handleSyncIfood = async () => {
    setIsSyncing(true);
    // Simulação ou chamada real se implementado no backend
    await new Promise(r => setTimeout(r, 2000));
    alert('Sincronização com iFood concluída!');
    setIsSyncing(false);
    fetchDados();
  };

  const handleToggleDisponibilidade = async (produto) => {
    try {
      const response = await products.update(produto.id, { disponivel: !produto.disponivel });
      if (response.success) {
        setProdutos(prev => prev.map(p => p.id === produto.id ? { ...p, disponivel: !p.disponivel } : p));
      }
    } catch (err) {
      console.error('Erro ao alterar disponibilidade:', err);
    }
  };

  const handleDeleteCategoria = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;
    
    try {
      const response = await categories.delete(id);
      if (response.success) fetchDados();
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
    }
  };

  const filteredProdutos = produtos.filter(p => {
    const matchCat = activeCategoriaId ? p.categoria_id === activeCategoriaId : true;
    const matchSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="dashboard admin-container" style={{ background: 'var(--bg-base)', minHeight: '100vh' }}>
      <header className="dashboard-header" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="header-info">
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>Cardápio Digital</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0 0' }}>Gerencie produtos, categorias e sincronize com o iFood.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="outline" onClick={handleSyncIfood} disabled={isSyncing}>
            <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} /> {isSyncing ? 'Sincronizando...' : 'Sincronizar iFood'}
          </Button>
          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <CloudDownload size={18} /> Importar Nova Lista
          </Button>
          <Button onClick={() => { setEditingProduto(null); setIsProdutoModalOpen(true); }}>
            <Plus size={18} /> Novo Produto
          </Button>
        </div>
      </header>

      <div className="dashboard-content cardapio-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', padding: '0 2rem 2rem 2rem' }}>
        {/* Sidebar de Categorias */}
        <aside className="vini-glass-panel" style={{ padding: '1rem', height: 'fit-content', position: 'sticky', top: '2rem' }}>
          <CategoriaList 
            categorias={categorias} 
            activeId={activeCategoriaId}
            onSelect={setActiveCategoriaId}
            onDelete={handleDeleteCategoria}
          />
          <button className="vini-btn-outline" style={{ width: '100%', marginTop: '1rem', borderStyle: 'dashed' }} onClick={() => alert('Nova Categoria')}>
            <Plus size={16} /> Adicionar Categoria
          </button>
        </aside>

        {/* Listagem de Produtos */}
        <div className="produtos-main">
          <div className="produtos-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', background: 'rgba(255,255,255,0.5)', padding: '1rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
            <div className="search-box" style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Buscar no cardápio..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 15px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }}
              />
            </div>
            <div className="filter-badge" style={{ fontWeight: '600', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} /> {filteredProdutos.length} Itens em {categorias.find(c => c.id === activeCategoriaId)?.nome || 'Categoria'}
            </div>
          </div>

          {loading ? (
            <div className="vini-loading" style={{ textAlign: 'center', padding: '4rem', color: 'var(--c-red)', fontWeight: '700' }}>Carregando cardápio...</div>
          ) : (
            <div className="produtos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {filteredProdutos.map(produto => (
                <ProdutoCard 
                  key={produto.id} 
                  produto={produto} 
                  onEdit={(p) => { setEditingProduto(p); setIsProdutoModalOpen(true); }}
                  onToggle={handleToggleDisponibilidade}
                />
              ))}
              {filteredProdutos.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.3)', borderRadius: '16px', border: '2px dashed var(--border-color)', color: 'var(--text-secondary)' }}>
                  <p>Nenhum produto encontrado nesta categoria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Manutenção de Produto */}
      <ProdutoModal 
        isOpen={isProdutoModalOpen}
        onClose={() => setIsProdutoModalOpen(false)}
        onSave={handleSaveProduto}
        produto={editingProduto}
        categorias={categorias}
      />

      {/* Modal de Importação iFood */}
      <ImportIfood 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={fetchDados}
      />
    </div>
  );
}

export default Cardapio;
