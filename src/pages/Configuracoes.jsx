import React, { useState, useEffect } from 'react';
import { 
  Building2, Mail, Phone, Clock, MapPin, 
  CreditCard, Link as LinkIcon, AlertTriangle, 
  Save, Layout, Globe, Palette, Settings,
  MessageSquare, Camera, Image, CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import '../styles/admin/cms.css';

function Configuracoes() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('geral');
  const [configs, setConfigs] = useState({
    site_title: 'Hot Dog do Vini',
    site_subtitle: 'O melhor hot dog da região',
    whatsapp_number: '',
    address_rua: '',
    address_numero: '',
    address_bairro: '',
    primary_color: '#ea1d2c',
    sales_enabled: '1',
    banner_url: '',
    notice_title: '',
    notice_message: '',
    notice_enabled: '0'
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const resp = await api.get('/config');
      if (resp.success) {
        setConfigs(prev => ({ ...prev, ...resp.data }));
      }
    } catch (err) {
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfigs(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const resp = await api.post('/config', { configs });
      if (resp.success) {
        toast.success('Configurações salvas com sucesso!');
      } else {
        toast.error('Erro ao salvar: ' + resp.error);
      }
    } catch (err) {
      toast.error('Erro de conexão ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Carregando CMS Industrial...</div>;

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="page-header">
        <div>
          <h2>Industrial CMS 🔥</h2>
          <p className="text-secondary">Controle dinâmico da marca e presença digital.</p>
        </div>
        <button 
          className={`btn vini-btn-primary ${saving ? 'loading' : ''}`} 
          onClick={handleSave}
          disabled={saving}
        >
          <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </header>

      <div className="cms-layout">
        <aside className="cms-sidebar vini-glass-panel">
          <nav>
            <button className={tab === 'geral' ? 'active' : ''} onClick={() => setTab('geral')}>
              <Building2 size={18}/> Perfil da Empresa
            </button>
            <button className={tab === 'site' ? 'active' : ''} onClick={() => setTab('site')}>
              <Layout size={18}/> Home & Landing
            </button>
            <button className={tab === 'vendas' ? 'active' : ''} onClick={() => setTab('vendas')}>
              <Settings size={18}/> Operação & Vendas
            </button>
            <button className={tab === 'visual' ? 'active' : ''} onClick={() => setTab('visual')}>
              <Palette size={18}/> Identidade Visual
            </button>
          </nav>
        </aside>

        <main className="cms-main-content">
          <div className="vini-glass-panel cms-panel-body">
            
            {tab === 'geral' && (
              <div className="cms-section">
                <h3>Informações Corporativas</h3>
                <div className="cms-grid">
                  <div className="form-group">
                    <label>Título do Site</label>
                    <input type="text" name="site_title" value={configs.site_title} onChange={handleChange} className="vini-input-dark" />
                  </div>
                  <div className="form-group">
                    <label>Slogan/Subtítulo</label>
                    <input type="text" name="site_subtitle" value={configs.site_subtitle} onChange={handleChange} className="vini-input-dark" />
                  </div>
                  <div className="form-group">
                    <label>WhatsApp Oficial</label>
                    <div className="input-with-icon">
                      <MessageSquare size={16}/>
                      <input type="text" name="whatsapp_number" value={configs.whatsapp_number} onChange={handleChange} className="vini-input-dark" placeholder="51999999999" />
                    </div>
                  </div>
                </div>
                
                <h3 className="mt-8">Endereço da Sede</h3>
                <div className="cms-grid">
                   <div className="form-group">
                      <label>Rua</label>
                      <input type="text" name="address_rua" value={configs.address_rua} onChange={handleChange} className="vini-input-dark" />
                   </div>
                   <div className="form-group">
                      <label>Número</label>
                      <input type="text" name="address_numero" value={configs.address_numero} onChange={handleChange} className="vini-input-dark" />
                   </div>
                   <div className="form-group">
                      <label>Bairro</label>
                      <input type="text" name="address_bairro" value={configs.address_bairro} onChange={handleChange} className="vini-input-dark" />
                   </div>
                </div>
              </div>
            )}

            {tab === 'site' && (
              <div className="cms-section">
                <h3>Gerenciamento de Landing Page</h3>
                
                <div className="cms-upload-box">
                  <div className="banner-preview" style={{ backgroundImage: `url(${configs.banner_url})` }}>
                    {!configs.banner_url && <><Image size={48} opacity={0.3}/> <span>Sem Banner</span></>}
                  </div>
                  <div className="upload-controls">
                    <label>URL do Banner Principal</label>
                    <input type="text" name="banner_url" value={configs.banner_url} onChange={handleChange} className="vini-input-dark" placeholder="https://..." />
                    <p className="text-muted text-xs">Recomendado: 1920x600px</p>
                  </div>
                </div>

                <div className="notice-config mt-8">
                   <div className="flex-between">
                      <h3>Aviso de Emergência (Notificação)</h3>
                      <label className="vini-switch">
                        <input type="checkbox" name="notice_enabled" checked={configs.notice_enabled === '1'} onChange={handleChange} />
                        <span className="slider"></span>
                      </label>
                   </div>
                   <div className="cms-grid mt-4">
                      <div className="form-group">
                        <label>Título da Notificação</label>
                        <input type="text" name="notice_title" value={configs.notice_title} onChange={handleChange} className="vini-input-dark" placeholder="Ex: Hoje não abriremos" />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Mensagem Detalhada</label>
                        <textarea name="notice_message" value={configs.notice_message} onChange={handleChange} className="vini-input-dark" rows={3}></textarea>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {tab === 'vendas' && (
              <div className="cms-section">
                <h3>Regras de Negócio</h3>
                
                <div className="status-box-control">
                  <div className={`status-card ${configs.sales_enabled === '1' ? 'active' : 'inactive'}`}>
                     <div className="status-info">
                        <strong>Vendas no Site</strong>
                        <span>{configs.sales_enabled === '1' ? 'Aberto para pedidos' : 'Loja FECHADA'}</span>
                     </div>
                     <button 
                        className={`mini-pill ${configs.sales_enabled === '1' ? 'btn-green' : 'btn-red'}`}
                        onClick={() => setConfigs(p => ({...p, sales_enabled: p.sales_enabled === '1' ? '0' : '1'}))}
                     >
                        {configs.sales_enabled === '1' ? 'FECHAR AGORA' : 'ABRIR LOJA'}
                     </button>
                  </div>
                </div>

                <div className="cms-info-alert mt-8">
                   <AlertTriangle size={20}/>
                   <div>
                      <strong>Nota de Produção:</strong>
                      <p>Para alterar preços ou taxa de entrega, utilize o Módulo de Logística ou Tabela de Preços.</p>
                   </div>
                </div>
              </div>
            )}

            {tab === 'visual' && (
              <div className="cms-section">
                 <h3>Branding & Design</h3>
                 <div className="cms-grid">
                    <div className="form-group">
                       <label>Cor Primária (Identidade)</label>
                       <div className="color-picker-wrapper">
                          <input type="color" name="primary_color" value={configs.primary_color} onChange={handleChange} />
                          <input type="text" value={configs.primary_color} readOnly className="vini-input-dark" />
                       </div>
                    </div>
                 </div>
                 
                 <div className="preview-branding mt-8">
                    <p className="text-secondary text-sm mb-4">Pré-visualização de componentes com a cor atual:</p>
                    <div className="flex gap-4">
                       <button className="btn" style={{ background: configs.primary_color, color: '#fff', border: 'none' }}>Botão de Exemplo</button>
                       <div className="vini-badge" style={{ backgroundColor: configs.primary_color + '22', color: configs.primary_color, border: `1px solid ${configs.primary_color}` }}>Badge</div>
                    </div>
                 </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default Configuracoes;
