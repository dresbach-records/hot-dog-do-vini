import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import './ProductModal.css';

const ProductModal = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState('');

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart({
      ...product,
      quantity,
      observations,
      totalPrice: parseFloat(product.price.replace('R$ ', '').replace(',', '.')) * quantity
    });
    onClose();
  };

  return (
    <div className="vini-modal-overlay" onClick={onClose}>
      <div className="vini-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="vini-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="vini-modal-body">
          <div className="vini-modal-img-container">
            <img src={product.image} alt={product.title} className="vini-modal-img" />
          </div>

          <div className="vini-modal-info">
            <h2 className="vini-modal-title">{product.title}</h2>
            <p className="vini-modal-description">{product.description}</p>
            <div className="vini-modal-price">{product.price}</div>

            <div className="vini-modal-section">
              <label>Quantidade</label>
              <div className="vini-qty-selector">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="vini-qty-btn"
                >
                  <Minus size={18} />
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="vini-qty-btn"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="vini-modal-section">
              <label>Observações</label>
              <textarea 
                placeholder="Ex: Sem cebola, pão separado..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="vini-modal-textarea"
              />
            </div>

            <button className="vini-modal-add-btn" onClick={handleAdd}>
              <ShoppingBag size={20} />
              Adicionar à sacola — R$ {(parseFloat(product.price.replace('R$ ', '').replace(',', '.')) * quantity).toFixed(2).replace('.', ',')}
            </button>
          </div>
        </div>
      </div>


    </div>
  );
};

export default ProductModal;
