import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';

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

      <style jsx>{`
        .vini-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
          backdrop-filter: blur(4px);
        }
        .vini-modal-content {
          background: #fff;
          border-radius: 24px;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .vini-modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #f5f5f5;
          border: none;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          z-index: 10;
          color: #666;
          transition: all 0.2s;
        }
        .vini-modal-close:hover { background: #eee; color: #000; }
        
        .vini-modal-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        @media (max-width: 768px) {
          .vini-modal-body { grid-template-columns: 1fr; }
        }
        
        .vini-modal-img-container {
          background: #f9f9f9;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .vini-modal-img {
          width: 100%;
          height: auto;
          border-radius: 16px;
          object-fit: cover;
          max-height: 400px;
        }
        
        .vini-modal-info {
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .vini-modal-title {
          font-size: 28px;
          font-weight: 800;
          margin: 0;
          color: #333;
        }
        .vini-modal-description {
          color: #666;
          line-height: 1.6;
          margin: 0;
        }
        .vini-modal-price {
          font-size: 24px;
          font-weight: 800;
          color: var(--p-red, #EA1D2C);
        }
        
        .vini-modal-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .vini-modal-section label {
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          color: #999;
          letter-spacing: 1px;
        }
        
        .vini-qty-selector {
          display: flex;
          align-items: center;
          gap: 20px;
          background: #f5f5f5;
          width: fit-content;
          padding: 5px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 18px;
        }
        .vini-qty-btn {
          background: #fff;
          border: 1px solid #ddd;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .vini-qty-btn:hover { border-color: var(--p-red); color: var(--p-red); }
        
        .vini-modal-textarea {
          width: 100%;
          min-height: 80px;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 15px;
          font-family: inherit;
          resize: none;
          transition: border-color 0.2s;
        }
        .vini-modal-textarea:focus { outline: none; border-color: var(--p-red); }
        
        .vini-modal-add-btn {
          margin-top: 10px;
          background: var(--p-red, #EA1D2C);
          color: #fff;
          border: none;
          padding: 18px;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: transform 0.2s, background 0.2s;
        }
        .vini-modal-add-btn:hover { transform: scale(1.02); background: #d71926; }
        .vini-modal-add-btn:active { transform: scale(0.98); }
      `}</style>
    </div>
  );
};

export default ProductModal;
