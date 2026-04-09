import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, AlertCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import './ProductModal.css';

const ProductModal = ({ product, onClose, onAddToCart, isPDV = false }) => {
  const { publicNotice } = useSettings();
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState('');
  const [selectedVariacao, setSelectedVariacao] = useState(null);
  const [selectedAdicionais, setSelectedAdicionais] = useState([]);
 
  if (!product) return null;

  const handleToggleAdicional = (adicional) => {
    setSelectedAdicionais(prev => 
      prev.find(a => a.id === adicional.id) 
        ? prev.filter(a => a.id !== adicional.id)
        : [...prev, adicional]
    );
  };

  const calculateTotal = () => {
    let basePrice = Number(product.preco);
    if (selectedVariacao) basePrice += Number(selectedVariacao.preco_adicional);
    const extrasPrice = selectedAdicionais.reduce((sum, a) => sum + Number(a.preco), 0);
    return (basePrice + extrasPrice) * quantity;
  };

  const handleAdd = () => {
    if (!isPDV && publicNotice && !publicNotice.salesEnabled) return;
    
    onAddToCart({
      ...product,
      quantity,
      observations,
      selectedVariacao,
      selectedAdicionais,
      totalPrice: calculateTotal()
    });
    onClose();
  };

  const modalThemeClass = isPDV ? 'vini-modal-pdv' : '';

  return (
    <div className={`vini-modal-overlay ${modalThemeClass}`} onClick={onClose}>
      <div className="vini-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="vini-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="vini-modal-body">
          <div className="vini-modal-img-container">
            <img 
              src={product.imagem_url || 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=600'} 
              alt={product.titulo} 
              className="vini-modal-img" 
            />
          </div>

          <div className="vini-modal-info">
            <h2 className="vini-modal-title">{product.titulo}</h2>
            <p className="vini-modal-description">{product.descricao}</p>
            <div className="vini-modal-price" style={{ color: isPDV ? '#22c55e' : 'var(--p-red)' }}>
              R$ {Number(product.preco).toFixed(2).replace('.', ',')}
            </div>

            {/* Variações */}
            {product.variacoes?.length > 0 && (
              <div className="vini-modal-section">
                <label>Opção obrigatória</label>
                <div className="vini-variacoes-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {product.variacoes.map(v => (
                    <label key={v.id} className="vini-custom-label selected-highlight">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="radio" name="variacao" onChange={() => setSelectedVariacao(v)} checked={selectedVariacao?.id === v.id} />
                        <span>{v.nome}</span>
                      </div>
                      {v.preco_adicional > 0 && <span className="p-badge">+ R$ {Number(v.preco_adicional).toFixed(2)}</span>}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Adicionais */}
            {product.adicionais?.length > 0 && (
              <div className="vini-modal-section">
                <label>Turbine seu pedido</label>
                <div className="vini-adicionais-list" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {product.adicionais.map(a => (
                    <label key={a.id} className="vini-custom-label">
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" onChange={() => handleToggleAdicional(a)} checked={!!selectedAdicionais.find(x => x.id === a.id)} />
                        <span style={{ fontSize: '0.85rem' }}>{a.nome}</span>
                      </div>
                      <span className="p-badge-small">+ R$ {Number(a.preco).toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="vini-modal-section">
              <label>Quantidade</label>
              <div className="vini-qty-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="vini-qty-btn"><Minus size={18} /></button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="vini-qty-btn"><Plus size={18} /></button>
              </div>
            </div>

            {(isPDV || !publicNotice || publicNotice.salesEnabled) ? (
              <button 
                className="vini-modal-add-btn" 
                onClick={handleAdd}
                style={{ background: isPDV ? '#22c55e' : 'var(--p-red)' }}
              >
                <ShoppingBag size={20} />
                {isPDV ? 'ADICIONAR AO CARRINHO' : 'ADICIONAR À SACOLA'} — R$ {calculateTotal().toFixed(2).replace('.', ',')}
              </button>
            ) : (
              <div className="vini-modal-add-btn disabled">
                <AlertCircle size={20} /> Vendas Suspensas
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
