import React from 'react';
import './produto-card.css';
import { Edit2, Power } from 'lucide-react';
import Badge from '../../ui/Badge';

const ProdutoCard = ({ produto, onEdit, onToggle }) => {
  const { titulo, descricao, preco, imagem_url, disponivel } = produto;

  return (
    <div className={`vini-card-produto ${!disponivel ? 'paused' : ''}`}>
      <div className="vini-card-img">
        <img src={imagem_url || '/placeholder-food.png'} alt={titulo} />
        <div className="vini-card-actions">
           <button onClick={() => onEdit(produto)} className="vini-btn-icon" title="Editar"><Edit2 size={16} /></button>
           <button onClick={() => onToggle(produto)} className="vini-btn-icon" title={disponivel ? "Pausar" : "Ativar"}><Power size={16} /></button>
        </div>
      </div>
      <div className="vini-card-info">
        <div className="vini-card-header">
           <h4 className="vini-card-title">{titulo}</h4>
           <Badge status={disponivel ? 'success' : 'danger'}>{disponivel ? 'Ativo' : 'Pausado'}</Badge>
        </div>
        <p className="vini-card-desc">{descricao}</p>
        <div className="vini-card-footer">
          <span className="vini-card-price">R$ {Number(preco).toFixed(2).replace('.', ',')}</span>
        </div>
      </div>
    </div>
  );
};

export default ProdutoCard;
