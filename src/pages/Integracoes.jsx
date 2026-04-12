import React, { useState, useEffect } from 'react';
import { 
  CloudDownload, Link2, RefreshCw, 
  Settings, CheckCircle, AlertTriangle,
  ExternalLink, Smartphone, MessageSquare,
  ShoppingBag, Printer
} from 'lucide-react';
import api from '../services/api';
import '../styles/admin/dashboard.css';
import ImportIfood from '../components/cardapio/importacao/import-ifood/ImportIfood';

function Integracoes() {
  const [ifoodStatus, setIfoodStatus] = useState({ connected: false });
  const [loading, setLoading] = useState(true);
  const [isIfoodModalOpen, setIsIfoodModalOpen] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ifood/status');
      if (res.success) setIfoodStatus(res);
    } catch (error) {
      console.error('Erro ao buscar status iFood:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIfoodAuth = async () => {
    try {
      const res = await api.post('/ifood/auth/start');
      if (res.success && res.data.userCode) {
        window.open(`https://portal.ifood.com.br/v2/apps/connect?userCode=${res.data.userCode}`, '_blank');
        alert(`Código de verificação: ${res.data.userCode}\nInsira este código no portal do iFood.`);
      }
    } catch (error) {
      alert('Erro ao iniciar autenticação iFood');
    }
  };

  const handleSyncAnotaAi = async () => {
     if (confirm('Deseja sincronizar o cardápio do Anota AI agora?')) {
        try {
           // No cenário real, aqui buscaríamos os dados do robô
           alert('Sincronizando com o atendente virtual...');
        } catch (error) {
           alert('Falha na sincronização');
        }
     }
  };

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '2rem' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Integrações</h2>
          <p className="text-secondary">Conecte o Vini's Delivery aos seus canais de venda favoritos.</p>
        </div>
      </header>

      <div className="grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        
        {/* IFOOD */}
        <div className="vini-glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <img src="https://logodownload.org/wp-content/uploads/2017/05/ifood-logo-1.png" alt="iFood" style={{ height: '30px' }} />
             <span className={`vini-badge ${ifoodStatus.connected ? 'success' : 'neutral'}`}>
                {ifoodStatus.connected ? 'CONECTADO' : 'DESCONECTADO'}
             </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Receba pedidos e sincronize seu cardápio com o maior marketplace do Brasil.</p>
          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
            {ifoodStatus.connected ? (
              <>
                <button onClick={() => setIsIfoodModalOpen(true)} className="vini-btn-primary" style={{ flex: 1, background: '#ea1d2c', borderColor: '#ea1d2c' }}>
                  <CloudDownload size={16} /> Importar Cardápio
                </button>
                <button className="vini-btn-outline icon-only"><Settings size={18} /></button>
              </>
            ) : (
              <button onClick={handleIfoodAuth} className="vini-btn-primary" style={{ flex: 1, background: '#ea1d2c', borderColor: '#ea1d2c' }}>
                Conectar iFood
              </button>
            )}
          </div>
        </div>

        {/* ANOTA AI */}
        <div className="vini-glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <h3 style={{ margin: 0, color: '#00d1b2', fontWeight: '800' }}>Anota AI</h3>
             <span className="vini-badge success">ATIVO</span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Atendimento automatizado via WhatsApp. Sincronização de produtos e categorias em tempo real.</p>
          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
             <button onClick={handleSyncAnotaAi} className="vini-btn-primary" style={{ flex: 1, background: '#00d1b2', borderColor: '#00d1b2' }}>
                <RefreshCw size={16} /> Sincronizar Cardápio
             </button>
             <button className="vini-btn-outline icon-only"><Settings size={18} /></button>
          </div>
        </div>

        {/* IMPRESSÃO */}
        <div className="vini-glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Printer color="#1e293b" />
              <h3 style={{ margin: 0 }}>Impressão Térmica</h3>
           </div>
           <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Imprima comandas de produção e vias de entrega automaticamente.</p>
           <div style={{ marginTop: 'auto' }}>
              <button className="vini-btn-outline" style={{ width: '100%' }}>Testar Impressora Local</button>
           </div>
        </div>

      </div>

      {isIfoodModalOpen && (
        <ImportIfood 
          isOpen={isIfoodModalOpen} 
          onClose={() => setIsIfoodModalOpen(false)} 
          onImportSuccess={fetchStatus} 
        />
      )}
    </div>
  );
}

export default Integracoes;
