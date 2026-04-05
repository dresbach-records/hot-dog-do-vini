import { Building2, Mail, Phone, Clock, MapPin, CreditCard, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

function Configuracoes() {
  const { publicNotice, updatePublicNotice } = useSettings();
  return (
    <div className="dashboard-page animate-fade-in">
      <header className="page-header">
        <div>
          <h2>Configurações do Sistema</h2>
          <p className="text-secondary">Dados da empresa, integrações e parâmetros da franquia.</p>
        </div>
      </header>

      <div className="caixa-content">
        <div className="vini-glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="config-section">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <Building2 size={20} color="var(--c-red)" />
              Dados da Empresa
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="info-group">
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Razão Social</span>
                <p style={{ fontWeight: '500' }}>MARCOS VINICIUS DRESBACH LTDA</p>
              </div>
              <div className="info-group">
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Nome Fantasia</span>
                <p style={{ fontWeight: '500' }}>HOT DOG DO VILI (VINI'S)</p>
              </div>
              <div className="info-group">
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>CNPJ</span>
                <p style={{ fontWeight: '500' }}>63.073.948/0001-97</p>
              </div>
              <div className="info-group">
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Site Oficial</span>
                <p style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <LinkIcon size={14} /> www.hotdogdovini.com.br
                </p>
              </div>
            </div>
          </div>

          <div className="config-section">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <Mail size={20} color="var(--c-yellow)" />
              Contatos e Financeiro
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="info-group">
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Email Administrativo</span>
                <p style={{ fontWeight: '500' }}>viniamaral2026@gmail.com</p>
              </div>
              <div className="info-group">
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Telefone Atendimento (Robô)</span>
                <p style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Phone size={14} /> (51) 9652-875
                </p>
              </div>
              <div className="info-group">
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Chave PIX (Provisória)</span>
                <p style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4ade80' }}>
                  <CreditCard size={14} /> vinis.pedidos@gmail.com
                </p>
              </div>
              <div className="info-group">
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Plataformas</span>
                <p style={{ fontWeight: '500' }}>iFood / Deias</p>
              </div>
            </div>
          </div>

          <div className="config-section" style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: '#ea1d2c' }}>
              <AlertTriangle size={20} color="#ea1d2c" />
              Gestão de Alertas Públicos
            </h3>
            
            <div style={{ background: 'var(--c-background)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Aviso na Página Inicial</h4>
                  <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Exibir uma mensagem flutuante de emergência abaixo do Menu Principal para os visitantes.</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', background: publicNotice.enabled ? '#fee2e2' : '#3f3f46', padding: '10px 20px', borderRadius: '30px' }}>
                  <input 
                    type="checkbox" 
                    checked={publicNotice.enabled} 
                    onChange={(e) => updatePublicNotice({ enabled: e.target.checked })} 
                    style={{ width: '18px', height: '18px', accentColor: '#ea1d2c', cursor: 'pointer' }}
                  />
                  <span style={{ marginLeft: '10px', fontWeight: 'bold', color: publicNotice.enabled ? '#dc2626' : '#a1a1aa' }}>
                    {publicNotice.enabled ? 'Aviso Ativo' : 'Oculto'}
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div>
                  <h4 style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.25rem' }}>Status das Vendas</h4>
                  <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Bloquear ou liberar novos pedidos no site e portal do cliente.</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', background: publicNotice.salesEnabled ? '#dcfce7' : '#fee2e2', padding: '10px 20px', borderRadius: '30px' }}>
                  <input 
                    type="checkbox" 
                    checked={publicNotice.salesEnabled} 
                    onChange={(e) => updatePublicNotice({ salesEnabled: e.target.checked })} 
                    style={{ width: '18px', height: '18px', accentColor: publicNotice.salesEnabled ? '#16a34a' : '#ea1d2c', cursor: 'pointer' }}
                  />
                  <span style={{ marginLeft: '10px', fontWeight: 'bold', color: publicNotice.salesEnabled ? '#16a34a' : '#dc2626' }}>
                    {publicNotice.salesEnabled ? 'Vendas Liberadas' : 'Vendas Bloqueadas'}
                  </span>
                </label>
              </div>

              {publicNotice.enabled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#e4e4e7' }}>Título da Mensagem</label>
                    <input 
                      type="text" 
                      value={publicNotice.title} 
                      onChange={(e) => updatePublicNotice({ title: e.target.value })}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', width: '100%', fontSize: '1rem' }}
                    />
                  </div>
                  
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontWeight: '600', fontSize: '0.9rem', color: '#e4e4e7' }}>Detalhes do Aviso</label>
                    <textarea 
                      value={publicNotice.message} 
                      onChange={(e) => updatePublicNotice({ message: e.target.value })}
                      style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', width: '100%', minHeight: '120px', resize: 'vertical', fontSize: '1rem', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        <div className="side-panel">
          <div className="vini-glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--c-red)" />
              Horário de Atendimento
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                <span className="text-secondary">Sexta-feira</span>
                <strong>14:30 às 22:30</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                <span className="text-secondary">Sábado</span>
                <strong>08:30 às 22:30</strong>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-secondary">Domingo</span>
                <strong>08:30 às 22:00</strong>
              </li>
            </ul>
          </div>

          <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--c-yellow)" />
              Logística e Agendamentos
            </h3>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
              <p style={{ marginBottom: '0.8rem' }}><strong>Atendimento de Segunda a Quinta:</strong> Somente via agendamento (um dia para o outro). Retirada no dia seguinte.</p>
              <p style={{ marginBottom: '0.8rem' }}><strong>Ponto de Retirada (Agendamentos):</strong> Entregues na Cris Du.</p>
              <p><strong>Cidades Atendidas:</strong> Igrejinha, Taquara e Parobé.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Configuracoes;
