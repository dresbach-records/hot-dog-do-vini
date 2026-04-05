import React, { useState } from 'react';
import './import-ifood.css';
import { CloudDownload, Search, X } from 'lucide-react';
import ifoodService from '../../../../services/ifood/ifoodService';
import ImportPreview from '../import-preview/ImportPreview';
import Button from '../../../ui/Button';

const ImportIfood = ({ isOpen, onClose, onImportSuccess }) => {
  const [merchantId, setMerchantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, message: '' });
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);

  const handleBuscar = async () => {
    if (!merchantId) return alert('Por favor, informe o Merchant ID do iFood.');
    
    setLoading(true);
    setProgress({ percent: 0, message: 'Iniciando...' });
    setError(null);
    
    try {
      const data = await ifoodService.buscarCardapio(merchantId, (percent, message) => {
        setProgress({ percent, message });
      });
      setPreviewData(data);
    } catch (err) {
      setError('Não foi possível carregar o cardápio. Verifique o ID e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async (selectedData) => {
    setLoading(true);
    const result = await ifoodService.confirmarImportacao(selectedData);
    if (result.success) {
      alert('Cardápio importado com sucesso!');
      onImportSuccess();
      onClose();
    } else {
      alert('Erro ao importar cardápio.');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="vini-modal-overlay">
      <div className="vini-modal-content import-modal">
        <header className="import-header">
           <div className="import-header-title">
             <CloudDownload className="vini-c-red" />
             <h3>Importar do iFood</h3>
           </div>
           <button onClick={onClose} className="vini-modal-close"><X size={20} /></button>
        </header>

        {!previewData ? (
          <div className="import-setup">
            <p className="import-desc">Insira o Merchant ID do seu restaurante no iFood para buscarmos as categorias e produtos automaticamente.</p>
            <div className="import-input-group">
              <input 
                type="text" 
                placeholder="Ex: 5c5fec43-2298-..." 
                value={merchantId}
                onChange={(e) => setMerchantId(e.target.value)}
                disabled={loading}
              />
              <Button 
                onClick={handleBuscar} 
                disabled={loading}
              >
                {loading ? 'Processando...' : <><Search size={18} /> Buscar Cardápio</>}
              </Button>
            </div>
            
            {loading && (
              <div className="import-progress-container">
                <div className="import-progress-bar">
                  <div className="import-progress-fill" style={{ width: `${progress.percent}%` }}></div>
                </div>
                <p className="import-progress-message">{progress.message}</p>
              </div>
            )}
            {error && <p className="import-error">{error}</p>}
          </div>
        ) : (
          <ImportPreview 
            data={previewData} 
            onConfirm={handleConfirmar} 
            onBack={() => setPreviewData(null)}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default ImportIfood;
