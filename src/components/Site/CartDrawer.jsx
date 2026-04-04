import React from 'react';
import { X, Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';

const CartDrawer = ({ isOpen, onClose, items, onUpdateQty, onRemove, onCheckout }) => {
  const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

  if (!isOpen) return null;

  return (
    <div className="vini-cart-overlay" onClick={onClose}>
      <div className="vini-cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="vini-cart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <ShoppingBag size={24} color="var(--p-red)" />
            <h2 className="vini-cart-title">Sua Sacola</h2>
          </div>
          <button className="vini-cart-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="vini-cart-items">
          {items.length === 0 ? (
            <div className="vini-cart-empty">
              <ShoppingBag size={64} color="#eee" />
              <p>Sua sacola está vazia</p>
              <button className="vini-cart-empty-btn" onClick={onClose}>Ver Cardápio</button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="vini-cart-item">
                <img src={item.image} alt={item.title} className="vini-cart-item-img" />
                <div className="vini-cart-item-info">
                  <div className="vini-cart-item-top">
                    <h4 className="vini-cart-item-title">{item.title}</h4>
                    <span className="vini-cart-item-price">R$ {item.totalPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {item.observations && (
                    <p className="vini-cart-item-obs">Obs: {item.observations}</p>
                  )}
                  <div className="vini-cart-item-actions">
                    <div className="vini-qty-mini">
                      <button onClick={() => onUpdateQty(idx, -1)} className="vini-qty-mini-btn">
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => onUpdateQty(idx, 1)} className="vini-qty-mini-btn">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button className="vini-cart-remove-btn" onClick={() => onRemove(idx)}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="vini-cart-footer">
            <div className="vini-cart-summary">
              <div className="vini-cart-summary-row">
                <span>Subtotal</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="vini-cart-summary-row total">
                <span>Total</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
            <button className="vini-cart-checkout-btn" onClick={onCheckout}>
              <span>Comprar tudo</span>
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .vini-cart-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 3000;
          backdrop-filter: blur(2px);
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .vini-cart-drawer {
          width: 100%;
          max-width: 450px;
          height: 100%;
          background: #fff;
          box-shadow: -10px 0 30px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        .vini-cart-header {
          padding: 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f0f0f0;
        }
        .vini-cart-title {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
        }
        .vini-cart-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          transition: color 0.2s;
        }
        .vini-cart-close:hover { color: #000; }
        
        .vini-cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .vini-cart-empty {
          height: 80%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #999;
          gap: 20px;
        }
        .vini-cart-empty-btn {
          background: #f5f5f5;
          border: none;
          padding: 12px 30px;
          border-radius: 12px;
          font-weight: 700;
          color: var(--p-red);
          cursor: pointer;
        }
        
        .vini-cart-item {
          display: flex;
          gap: 15px;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 16px;
          transition: transform 0.2s;
        }
        .vini-cart-item:hover { transform: scale(1.01); }
        .vini-cart-item-img {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          object-fit: cover;
        }
        .vini-cart-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .vini-cart-item-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }
        .vini-cart-item-title {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
        }
        .vini-cart-item-price {
          font-weight: 800;
          color: var(--p-red);
          white-space: nowrap;
        }
        .vini-cart-item-obs {
          font-size: 12px;
          color: #999;
          margin: 5px 0;
          font-style: italic;
        }
        
        .vini-cart-item-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
        }
        .vini-qty-mini {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff;
          padding: 4px;
          border-radius: 8px;
          border: 1px solid #eee;
          font-weight: 800;
          font-size: 14px;
        }
        .vini-qty-mini-btn {
          background: #f5f5f5;
          border: none;
          padding: 4px;
          border-radius: 4px;
          cursor: pointer;
        }
        .vini-cart-remove-btn {
          background: none;
          border: none;
          color: #ccc;
          cursor: pointer;
          transition: color 0.2s;
        }
        .vini-cart-remove-btn:hover { color: var(--p-red); }
        
        .vini-cart-footer {
          padding: 30px;
          background: #fff;
          border-top: 1px solid #f0f0f0;
          box-shadow: 0 -10px 30px rgba(0,0,0,0.05);
        }
        .vini-cart-summary {
          margin-bottom: 25px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .vini-cart-summary-row {
          display: flex;
          justify-content: space-between;
          color: #666;
        }
        .vini-cart-summary-row.total {
          color: #000;
          font-size: 20px;
          font-weight: 900;
          padding-top: 10px;
          border-top: 1px dashed #eee;
        }
        
        .vini-cart-checkout-btn {
          width: 100%;
          background: var(--p-red);
          color: #fff;
          border: none;
          padding: 20px;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: transform 0.2s, filter 0.2s;
        }
        .vini-cart-checkout-btn:hover { filter: brightness(1.1); transform: scale(1.02); }
      `}</style>
    </div>
  );
};

export default CartDrawer;
