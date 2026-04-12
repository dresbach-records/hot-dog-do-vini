import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Users, MessageCircle, 
  Plus, Calendar, BarChart3, 
  Send, Trash2, CheckCircle, Tag, 
  Scissors, Gift, RefreshCcw, X
} from 'lucide-react';
import api from '../services/api';
import '../styles/admin/dashboard.css';

function Marketing() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'campaigns') {
        const res = await api.get('/marketing/campanhas');
        if (res.success) setCampaigns(res.data);
      } else {
        const res = await api.get('/marketing/cupons');
        if (res.success) setCoupons(res.data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados de marketing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === 'campaigns' ? '/marketing/campanhas' : '/marketing/cupons';
      const res = await api.post(endpoint, formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({});
        fetchData();
      }
    } catch (error) {
      alert('Erro ao salvar');
    }
  };

  const toggleCoupon = async (id, currentStatus) => {
    try {
      const res = await api.put(`/marketing/cupons/${id}/toggle`, { active: !currentStatus });
      if (res.success) fetchData();
    } catch (error) {
      alert('Erro ao alterar cupom');
    }
  };

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '2rem' }}>
      <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Marketing & Engajamento</h2>
          <p className="text-secondary">Crie campanhas de WhatsApp, gerencie cupons e fidelize seus clientes.</p>
        </div>
        <button className="vini-btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> {activeTab === 'campaigns' ? 'Nova Campanha' : 'Novo Cupom'}
        </button>
      </header>

          <div className="stat-icon-wrapper bg-green-light">
            <MessageCircle size={24} color="var(--c-green)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">WhatsApp Disparos</span>
            <h3 className="stat-value text-positive">1.204 / 5.000</h3>
            <span className="stat-trend neutral">Anota AI Integrado</span>
          </div>
        </div>
      </div>

      <div className="vini-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('cupons')}
          style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: activeTab === 'cupons' ? '700' : '500', color: activeTab === 'cupons' ? 'var(--c-red)' : 'var(--text-secondary)', paddingBottom: '0.5rem', borderBottom: activeTab === 'cupons' ? '2px solid var(--c-red)' : '2px solid transparent', cursor: 'pointer' }}
        >
          Gerenciador de Cupons
        </button>
        <button 
          onClick={() => setActiveTab('whatsapp')}
          style={{ background: 'none', border: 'none', fontSize: '1rem', fontWeight: activeTab === 'whatsapp' ? '700' : '500', color: activeTab === 'whatsapp' ? 'var(--c-red)' : 'var(--text-secondary)', paddingBottom: '0.5rem', borderBottom: activeTab === 'whatsapp' ? '2px solid var(--c-red)' : '2px solid transparent', cursor: 'pointer' }}
        >
          Campanha WhatsApp
        </button>
      </div>

      {activeTab === 'cupons' && (
        <div className="vini-glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="section-header" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Cupons Ativos e Histórico</h3>
            <button className="vini-btn-outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
              <Ticket size={16} /> Criar Cupom
            </button>
          </div>
          <div className="table-responsive">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-active)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Código</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Desconto</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Resgates</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {cupons.map((cupom, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', opacity: cupom.status === 'Esgotado' ? 0.6 : 1 }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ background: 'var(--bg-surface-elevated)', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px dashed var(--border-color)', fontFamily: 'monospace', color: 'var(--c-red)' }}>
                          {cupom.codigo}
                        </strong>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Copiar"><Copy size={14}/></button>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{cupom.desconto}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ width: '100%', background: 'var(--border-color)', borderRadius: '4px', height: '6px', overflow: 'hidden', marginBottom: '4px' }}>
                        <div style={{ width: `${(cupom.usados / cupom.limite)*100}%`, background: cupom.status === 'Esgotado' ? 'var(--text-muted)' : 'var(--c-blue)', height: '100%' }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cupom.usados} / {cupom.limite}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                       <span className={`vini-badge ${cupom.status === 'Ativo' ? 'success' : 'neutral'}`}>{cupom.status}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                       <button className="vini-btn-action secondary" style={{ fontSize: '0.8rem' }}>Editar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'whatsapp' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '1.5rem' }}>
          <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Nova Mensagem Push</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Dispare mensagens promocionais para sua base de clientes cadastrada no sistema ou iFood.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Público Alvo</label>
                <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}>
                  <option>Todos os clientes (1.204 pessoas)</option>
                  <option>Cartela de Fiados (23 pessoas)</option>
                  <option>Aniversário no Mês (45 pessoas)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Texto da Mensagem</label>
                <textarea rows={5} placeholder="Olá! Aqui é do Vini's Delivery! Tem promoção rolando..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', resize: 'vertical' }}></textarea>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>Utilize *texto* para negrito.</div>
              </div>

              <button className="vini-btn-primary" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center', marginTop: '0.5rem' }}>
                <Send size={18} /> Disparar para 1.204 contatos
              </button>
            </div>
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
               <AlertCircle size={16} color="var(--c-yellow)" style={{ flexShrink: 0, marginTop: '2px' }} />
               <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Para evitar banimento do WhatsApp, as mensagens são enviadas em fila (aprox. 1 a cada 3 segundos).</p>
            </div>
          </div>

          <div className="vini-glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', background: 'var(--bg-surface-elevated)' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Preview da Mensagem</h3>
            
            {/* Mock Chat View */}
            <div style={{ flex: 1, background: '#ede5dd', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid #d1d5db', overflow: 'hidden', position: 'relative' }}>
              <div style={{ background: '#d9fdd3', padding: '0.8rem', borderRadius: '8px 8px 0 8px', maxWidth: '85%', alignSelf: 'flex-end', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#111b21', lineHeight: '1.4' }}>
                  Aproveite essa promoção de fim de semana! Cupom <strong>FDS10</strong> pra ganhar 10% OFF no app.
                </p>
                <span style={{ fontSize: '0.65rem', color: '#667781', display: 'block', textAlign: 'right', marginTop: '5px' }}>18:30 ✓✓</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Marketing;
