import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Image as ImageIcon } from 'lucide-react';
import Button from '../../ui/Button';

const ProdutoModal = ({ isOpen, onClose, onSave, produto, categorias }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    preco: '',
    categoria_id: '',
    imagem_url: '',
    disponivel: true
  });

  useEffect(() => {
    if (produto) {
      setFormData({
        titulo: produto.titulo || '',
        descricao: produto.descricao || '',
        preco: produto.preco || '',
        categoria_id: produto.categoria_id || '',
        imagem_url: produto.imagem_url || '',
        disponivel: produto.disponivel !== undefined ? produto.disponivel : true
      });
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        preco: '',
        categoria_id: categorias[0]?.id || '',
        imagem_url: '',
        disponivel: true
      });
    }
  }, [produto, categorias]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.preco || !formData.categoria_id) {
      return alert('Por favor, preencha nome, preço e categoria.');
    }
    onSave({ ...produto, ...formData });
  };

  if (!isOpen) return null;

  return (
    <div className="vini-modal-overlay">
      <div className="vini-modal-content" style={{ maxWidth: '500px', width: '90%' }}>
        <header className="vini-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>{produto ? 'Editar Produto' : 'Novo Produto'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Título do Produto</label>
            <input 
              type="text" 
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ex: Hot Dog Especial"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Preço (R$)</label>
              <input 
                type="number" 
                step="0.01"
                name="preco"
                value={formData.preco}
                onChange={handleChange}
                placeholder="0,00"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
                required
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Categoria</label>
              <select 
                name="categoria_id"
                value={formData.categoria_id}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', background: '#fff' }}
                required
              >
                <option value="">Selecione...</option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.titulo}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Descrição</label>
            <textarea 
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Ingredientes e detalhes..."
              rows="3"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', resize: 'vertical' }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>URL da Imagem</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                name="imagem_url"
                value={formData.imagem_url}
                onChange={handleChange}
                placeholder="https://..."
                style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none' }}
              />
              <div style={{ width: '45px', height: '45px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {formData.imagem_url ? <img src={formData.imagem_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={20} color="#ccc" />}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.5rem' }}>
            <input 
              type="checkbox" 
              name="disponivel"
              id="chk-disponivel"
              checked={formData.disponivel}
              onChange={handleChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="chk-disponivel" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>Produto Disponível para Venda</label>
          </div>

          <footer style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Button variant="outline" type="button" onClick={onClose} style={{ flex: 1 }}>Cancelar</Button>
            <Button type="submit" style={{ flex: 1 }}>
              <Save size={18} /> Salvar Produto
            </Button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ProdutoModal;
