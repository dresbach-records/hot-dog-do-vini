import React from 'react';
import './categoria-list.css';
import { Tag, Trash2 } from 'lucide-react';

const CategoriaList = ({ categorias, activeId, onSelect, onDelete }) => {
  return (
    <div className="vini-categoria-sidebar">
      <h3 className="sidebar-title">Categorias</h3>
      <div className="categoria-items">
        <button 
          className={`cat-item ${!activeId ? 'active' : ''}`}
          onClick={() => onSelect(null)}
        >
          <Tag size={16} /> Todos os Produtos
        </button>
        {categorias.map(cat => (
          <div key={cat.id} className={`cat-item-wrapper ${activeId === cat.id ? 'active' : ''}`}>
            <button 
              className="cat-item-main"
              onClick={() => onSelect(cat.id)}
            >
              <Tag size={16} /> {cat.nome}
            </button>
            <button 
              className="cat-btn-delete" 
              onClick={(e) => { e.stopPropagation(); onDelete(cat.id); }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriaList;
