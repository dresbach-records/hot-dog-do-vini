import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Image as ImageIcon, Plus, ListChecks } from 'lucide-react';
import Button from '../../ui/Button';
import { estoque } from '../../../services/api';

const ProdutoModal = ({ isOpen, onClose, onSave, produto, categorias }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    preco: '',
    categoria_id: '',
    imagem_url: '',
    disponivel: true,
    ncm: '2106.90.90'
  });

  const [insumosList, setInsumosList] = useState([]);
  const [receita, setReceita] = useState([]); // [{ insumo_id, quantidade_necessaria }]
  const [activeTab, setActiveTab] = useState('dados'); // 'dados' ou 'receita'

  useEffect(() => {
    if (isOpen) {
      fetchInsumos();
      if (produto && produto.id) {
        fetchReceita(produto.id);
        setFormData({
          titulo: produto.titulo || '',
          descricao: produto.descricao || '',
          preco: produto.preco || '',
          categoria_id: produto.categoria_id || '',
          imagem_url: produto.imagem_url || '',
          disponivel: produto.disponivel !== undefined ? produto.disponivel : true,
          ncm: produto.ncm || '2106.90.90'
        });
      } else {
        setReceita([]);
        setFormData({
          titulo: '',
          descricao: '',
          preco: '',
          categoria_id: categorias[0]?.id || '',
          imagem_url: '',
          disponivel: true,
          ncm: '2106.90.90'
        });
      }
    }
  }, [isOpen, produto, categorias]);

  const fetchInsumos = async () => {
    try {
      const resp = await estoque.listInsumos();
      if (resp.success) setInsumosList(resp.data);
    } catch (err) {
      console.error('Erro ao buscar insumos para receita:', err);
    }
  };

  const fetchReceita = async (id) => {
    try {
      const resp = await estoque.getReceita(id);
      if (resp.success) setReceita(resp.data);
    } catch (err) {
      console.error('Erro ao buscar receita:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddIngrediente = () => {
    setReceita([...receita, { insumo_id: '', quantidade_necessaria: 1 }]);
  };

  const handleRemoveIngrediente = (index) => {
    setReceita(receita.filter((_, i) => i !== index));
  };

  const handleIngredienteChange = (index, field, value) => {
    const newReceita = [...receita];
    newReceita[index][field] = value;
    setReceita(newReceita);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.preco || !formData.categoria_id) {
      return alert('Por favor, preencha nome, preço e categoria.');
    }

    try {
      // 1. Salvar Produto (via prop onSave que cuida do fetch/api)
      const res = await onSave({ ...produto, ...formData });
      
      // 2. Salvar Receita se tivermos um ID de produto 
      // Agora usamos o id do produto atual OR o id retornado pelo res (se for novo)
      const finalId = produto?.id || res?.data?.id;
      
      if (finalId) {
         await estoque.saveReceita(finalId, receita);
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="vini-modal-overlay">
      <div className="vini-modal-content" style={{ maxWidth: '600px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
        <header className="vini-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div>
             <h3 style={{ margin: 0 }}>{produto ? 'Editar Produto' : 'Novo Produto'}</h3>
             <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Configure os dados e a ficha técnica para baixa de estoque.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </header>

        {/* ABAS */}
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
           <button 
             onClick={() => setActiveTab('dados')} 
             style={{ padding: '0.5rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'dados' ? '2px solid var(--c-red)' : 'none', fontWeight: activeTab === 'dados' ? '700' : '400', cursor: 'pointer', color: activeTab === 'dados' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
             Dados Básicos
           </button>
           <button 
             onClick={() => setActiveTab('receita')} 
             style={{ padding: '0.5rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'receita' ? '2px solid var(--c-red)' : 'none', fontWeight: activeTab === 'receita' ? '700' : '400', cursor: 'pointer', color: activeTab === 'receita' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
             Ficha Técnica (Estoque)
           </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {activeTab === 'dados' && (
            <>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Título do Produto</label>
                <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Ex: Hot Dog Especial" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Preço (R$)</label>
                  <input type="number" step="0.01" name="preco" value={formData.preco} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} required />
                </div>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Categoria</label>
                  <select name="categoria_id" value={formData.categoria_id} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: '#fff' }} required>
                    <option value="">Selecione...</option>
                    {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.titulo}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Descrição</label>
                <textarea name="descricao" value={formData.descricao} onChange={handleChange} placeholder="Ingredientes e detalhes..." rows="2" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', resize: 'vertical' }} />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>MÓDULO FISCAL (NCM)</label>
                <input type="text" name="ncm" value={formData.ncm} onChange={handleChange} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
              </div>
            </>
          )}

          {activeTab === 'receita' && (
            <div className="receita-section">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem' }}><ListChecks size={16} /> Composição de Insumos</h4>
                  <Button type="button" variant="outline" onClick={handleAddIngrediente} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                    <Plus size={14} /> Add Insumo
                  </Button>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                 {receita.map((item, index) => (
                   <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--bg-active)', padding: '0.5rem', borderRadius: '8px' }}>
                     <select 
                       value={item.insumo_id} 
                       onChange={(e) => handleIngredienteChange(index, 'insumo_id', e.target.value)}
                       style={{ flex: 2, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                     >
                       <option value="">Selecione Insumo...</option>
                       {insumosList.map(i => <option key={i.id} value={i.id}>{i.nome} ({i.unidade})</option>)}
                     </select>
                     <input 
                       type="number" 
                       value={item.quantidade_necessaria} 
                       onChange={(e) => handleIngredienteChange(index, 'quantidade_necessaria', e.target.value)}
                       placeholder="Qtd"
                       style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', width: '60px' }} 
                     />
                     <button type="button" onClick={() => handleRemoveIngrediente(index)} style={{ background: 'none', border: 'none', color: 'var(--c-red)', cursor: 'pointer' }}>
                       <Trash2 size={16} />
                     </button>
                   </div>
                 ))}
                 {receita.length === 0 && (
                   <div style={{ textAlign: 'center', padding: '1rem', border: '1px dashed var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                     Nenhum insumo vinculado. Este produto não descontará estoque automaticamente.
                   </div>
                 )}
               </div>
            </div>
          )}

          <footer style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Button variant="outline" type="button" onClick={onClose} style={{ flex: 1 }}>Cancelar</Button>
            <Button type="submit" style={{ flex: 1 }}>
              <Save size={18} /> {produto ? 'Atualizar Tudo' : 'Criar Produto'}
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ProdutoModal;
