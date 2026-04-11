import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Settings, 
  CheckCircle2, 
  HelpCircle,
  Hash,
  Building,
  Key,
  Database
} from 'lucide-react';

function Fiscal() {
  const [fiscalConfig, setFiscalConfig] = useState({
    active: false,
    cnpj: '63.073.948/0001-97',
    inscEstadual: '',
    regime: 'mei', // mei, simples, lucro_presumido
    cscToken: '',
    cscId: '',
    ncmPadrao: '2106.90.90',
    cfopPadrao: '5102',
    ambiente: 'homologacao' // homologacao, producao
  });

  const handleToggle = () => {
    setFiscalConfig(prev => ({ ...prev, active: !prev.active }));
  };

  const [certStatus, setCertStatus] = useState({
    loading: true,
    found: false,
    message: 'Verificando...',
    data: null
  });

  useEffect(() => {
    const checkCert = async () => {
      try {
        const res = await api.get('/fiscal/status');
        if (res.success && res.status === 'ENCONTRADO') {
          setCertStatus({
            loading: false,
            found: true,
            message: 'Certificado Detectado',
            data: res.data
          });
        } else {
          setCertStatus({
            loading: false,
            found: false,
            message: res.message || 'Não Encontrado',
            data: res.data
          });
        }
      } catch (err) {
        setCertStatus({
          loading: false,
          found: false,
          message: 'Erro de Conexão',
          data: null
        });
      }
    };
    checkCert();

    const fetchConfig = async () => {
      try {
        const res = await api.get('/fiscal/config');
        if (res.success) {
          setFiscalConfig(prev => ({
            ...prev,
            ...res.data,
            active: res.data.token_ativo
          }));
        }
      } catch (err) {
        console.error('Erro ao buscar config fiscal', err);
      }
    };
    fetchConfig();
  }, []);

  return (
    <div className="dashboard animate-fade-in">
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'var(--c-yellow)', padding: '10px', borderRadius: '12px' }}>
            <FileText size={24} color="#000" />
          </div>
          <div>
            <h2>Módulo Fiscal (NFC-e) 🧾</h2>
            <p>Gerencie a emissão de Nota Fiscal de Consumidor Eletrônica.</p>
          </div>
        </div>
        {!fiscalConfig.active && (
          <div className="vini-badge warning" style={{ padding: '8px 20px' }}>
            <AlertTriangle size={14} style={{ marginRight: '8px' }} /> MÓDULO DESATIVADO
          </div>
        )}
      </header>

      <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
        
        {/* CONFIGURAÇÃO FISCAL */}
        <div className="vini-glass-panel" style={{ padding: '2rem' }}>
          
          <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>Parâmetros da SEFAZ</h3>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configure seus dados oficiais para integração.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>ATIVAR EMISSÃO</span>
              <label className="vini-switch">
                <input type="checkbox" checked={fiscalConfig.active} onChange={handleToggle} />
                <span className="vini-slider"></span>
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
             <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Regime Tributário</label>
                <select className="vini-input-dark" style={{ width: '100%' }} value={fiscalConfig.regime}>
                   <option value="mei">MEI - Microempreendedor Individual</option>
                   <option value="simples">Simples Nacional</option>
                   <option value="lucro_presumido">Lucro Presumido</option>
                </select>
             </div>
             <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Ambiente de Emissão</label>
                <select className="vini-input-dark" style={{ width: '100%' }} value={fiscalConfig.ambiente}>
                   <option value="homologacao">Homologação (Sem Valor Fiscal)</option>
                   <option value="producao">Produção (Valor Real)</option>
                </select>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
             <div className="form-group">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem' }}>Inscrição Estadual (IE)</label>
                <input type="text" className="vini-input-dark" value={fiscalConfig.inscEstadual} onChange={(e) => setFiscalConfig({...fiscalConfig, inscEstadual: e.target.value})} placeholder="Número IE" style={{ width: '100%' }} />
             </div>
             <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px', fontSize: '0.85rem' }}>
                  NCM Padrão <HelpCircle size={12} color="var(--text-muted)" />
                </label>
                <input type="text" className="vini-input-dark" value={fiscalConfig.ncmPadrao} style={{ width: '100%' }} />
             </div>
          </div>

          <div className="fiscal-auth-section" style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
             <h4 style={{ margin: '0 0 15px 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={16} color="var(--c-yellow)" /> Token de Integração (CSC)
             </h4>
             <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem' }}>
                <input type="text" className="vini-input-dark" placeholder="ID" />
                <input type="text" className="vini-input-dark" placeholder="TOKEN CSC" />
             </div>
             <p style={{ margin: '15px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
               Consulte sua chave CSC no portal da SEFAZ do seu estado.
             </p>
          </div>

          <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
             <button className="vini-btn-outline">Cancelar</button>
             <button className="btn vini-btn-primary">Salvar Configurações Fiscais</button>
          </div>
        </div>

        {/* LADO DIREITO: STATUS E AJUDA */}
        <div style={{ position: 'sticky', top: '2rem' }}>
          <div className="vini-glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
             <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={18} color="var(--c-blue)" /> Status do Sistema
             </h3>
             <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                 <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                   <span className="text-secondary">API Fiscal (FocusNFe)</span>
                   <strong style={{ color: fiscalConfig.token_ativo ? 'var(--c-green)' : 'var(--c-yellow)' }}>
                     {fiscalConfig.token_ativo ? 'Conectado (Token OK)' : 'Aguardando Token'}
                   </strong>
                 </li>
                 <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                   <span className="text-secondary">Certificado Digital</span>
                   <strong style={{ color: certStatus.found ? 'var(--c-green)' : 'var(--c-red)' }}>
                     {certStatus.message}
                   </strong>
                 </li>
                 {certStatus.found && (
                   <li style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '-5px' }}>
                     Caminho: {certStatus.data?.path}
                   </li>
                 )}
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-secondary">Última NF emitida</span>
                  <strong style={{ color: 'var(--text-muted)' }}>Nenhuma</strong>
                </li>
             </ul>
          </div>

          <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
             <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Como funciona? 🤔</h3>
             <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
               1. Configure seus dados fiscais e o Certificado A1.<br />
               2. O sistema gera automaticamente a NFC-e após cada pedido pago.<br />
               3. O XML e o DANFE (PDF) são enviados ao e-mail do cliente e ficam disponíveis no seu histórico.
             </p>
             <div style={{ marginTop: '1.5rem', padding: '10px', background: 'rgba(234, 29, 44, 0.05)', borderRadius: '8px', border: '1px solid var(--c-red)' }}>
               <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: 'var(--c-red)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                 <AlertTriangle size={12} /> Requer Certificado Digital A1
               </p>
             </div>
          </div>
        </div>

      </div>

      <style>{`
        .vini-switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        .vini-switch input { opacity: 0; width: 0; height: 0; }
        .vini-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #3f3f46;
          transition: .4s;
          border-radius: 34px;
        }
        .vini-slider:before {
          position: absolute;
          content: "";
          height: 18px; width: 18px;
          left: 3px; bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .vini-slider { background-color: var(--c-yellow); }
        input:checked + .vini-slider:before { transform: translateX(26px); }
      `}</style>
    </div>
  );
}

export default Fiscal;
