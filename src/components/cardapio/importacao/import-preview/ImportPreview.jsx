import React, { useState } from 'react';
import './import-preview.css';
import { ChevronLeft, CheckCircle2, ChevronRight, Package, Grid } from 'lucide-react';
import Badge from '../../../ui/Badge';
import Button from '../../../ui/Button';

const ImportPreview = ({ data, onConfirm, onBack, loading }) => {
  const [selectedIndices, setSelectedIndices] = useState(data.map((_, i) => i));

  const toggleCategory = (index) => {
    setSelectedIndices(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleConfirm = () => {
    const selectedData = data.filter((_, i) => selectedIndices.includes(i));
    onConfirm(selectedData);
  };

  return (
    <div className="import-preview-container">
      <header className="preview-header">
        <button onClick={onBack} className="btn-back"><ChevronLeft size={18} /> Voltar</button>
        <h4>Revisar Cardápio Importado ({data.length} Categorias)</h4>
      </header>

      <div className="preview-list">
        {data.map((cat, idx) => (
          <div key={cat.ifood_id} className={`preview-cat ${selectedIndices.includes(idx) ? 'selected' : ''}`}>
            <div className="preview-cat-header" onClick={() => toggleCategory(idx)}>
              <div className="cat-info">
                <Grid size={18} className="cat-icon" />
                <span className="cat-name">{cat.nome}</span>
                <Badge status="badge-success">{cat.produtos.length} Itens</Badge>
              </div>
              <div className={`checkbox ${selectedIndices.includes(idx) ? 'checked' : ''}`}>
                <CheckCircle2 size={20} />
              </div>
            </div>
            {selectedIndices.includes(idx) && (
              <div className="preview-products">
                {cat.produtos.map(p => (
                  <div key={p.ifood_id} className="preview-item">
                    <Package size={14} className="item-icon" />
                    <span className="item-title">{p.titulo}</span>
                    <span className="item-price">R$ {p.preco.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <footer className="preview-footer">
        <p className="footer-info">Os dados duplicados serão atualizados com base no ID do iFood.</p>
        <Button 
          onClick={handleConfirm} 
          disabled={loading || selectedIndices.length === 0}
        >
          {loading ? 'Processando...' : 'Confirmar Importação'}
        </Button>
      </footer>
    </div>
  );
};

export default ImportPreview;
