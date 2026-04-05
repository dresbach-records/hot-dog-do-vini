import React, { useState } from 'react';
import { CreditCard, QrCode, Smartphone, Settings, Building, AlertCircle } from 'lucide-react';
import '../styles/admin/dashboard.css';

function Pagamentos() {
  const [pixAtivo, setPixAtivo] = useState(true);
  const [cartaoAtivo, setCartaoAtivo] = useState(true);
  const [fiadoAtivo, setFiadoAtivo] = useState(false);

  const maquininhas = [
    { id: 1, marca: 'Stone', modelo: 'SmartPOS P2', serial: 'ST-9921', status: 'Ativa', txDebito: '1.2%', txCredito: '3.5%' },
    { id: 2, marca: 'PagSeguro', modelo: 'Moderninha Pro', serial: 'PG-1002', status: 'Manutenção', txDebito: '1.5%', txCredito: '3.8%' },
  ];

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem', background: 'var(--bg-base)' }}>
      <header className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h2>Gateways & Pagamentos</h2>
          <p className="text-secondary">Configuração de métodos de pagamento, chaves PIX e conciliação bancária.</p>
        </div>
      </header>

      {/* MÉTRICAS */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-green-light">
            <QrCode size={24} color="var(--c-green)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pagamentos via PIX</span>
            <h3 className="stat-value">62%</h3>
            <span className="stat-trend positive">Método preferido</span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-blue-light">
            <CreditCard size={24} color="var(--c-blue)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pagamentos Cartão/Maquininha</span>
            <h3 className="stat-value">33%</h3>
            <span className="stat-trend neutral">R$ 480,00 Taxas (Mês)</span>
          </div>
        </div>

        <div className="vini-card-stat vini-glass-panel" style={{ padding: '1.5rem' }}>
          <div className="stat-icon-wrapper bg-yellow-light">
            <Building size={24} color="var(--c-yellow)" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Fiado / Pendentes</span>
            <h3 className="stat-value">5%</h3>
            <span className="stat-trend negative">Inadimplência sob controle</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) minmax(400px, 2fr)', gap: '1.5rem' }}>
        
        {/* COLUNA ESQUERDA: CONFIGURAÇÕES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={18} /> Métodos Ativos no Delivery
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <QrCode size={20} color="var(--c-green)" />
                  <div>
                    <span style={{ fontWeight: '600', display: 'block' }}>PIX Copia e Cola</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Retorno automático via API</span>
                  </div>
                </div>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                  <input type="checkbox" checked={pixAtivo} onChange={() => setPixAtivo(!pixAtivo)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span className="slider" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: pixAtivo ? 'var(--c-green)' : '#ccc', borderRadius: '34px', transition: '.4s' }}>
                    <span style={{ position: 'absolute', content: '""', height: '14px', width: '14px', left: '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s', transform: pixAtivo ? 'translateX(20px)' : 'none' }}></span>
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <CreditCard size={20} color="var(--c-blue)" />
                  <div>
                    <span style={{ fontWeight: '600', display: 'block' }}>Cartão (MercadoPago)</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Checkout Transparente</span>
                  </div>
                </div>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                  <input type="checkbox" checked={cartaoAtivo} onChange={() => setCartaoAtivo(!cartaoAtivo)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span className="slider" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: cartaoAtivo ? 'var(--c-blue)' : '#ccc', borderRadius: '34px', transition: '.4s' }}>
                    <span style={{ position: 'absolute', content: '""', height: '14px', width: '14px', left: '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s', transform: cartaoAtivo ? 'translateX(20px)' : 'none' }}></span>
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <Building size={20} color="var(--c-yellow)" />
                  <div>
                    <span style={{ fontWeight: '600', display: 'block' }}>Fiado Online</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Apenas clientes corporativos</span>
                  </div>
                </div>
                <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '40px', height: '20px' }}>
                  <input type="checkbox" checked={fiadoAtivo} onChange={() => setFiadoAtivo(!fiadoAtivo)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span className="slider" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: fiadoAtivo ? 'var(--c-yellow)' : '#ccc', borderRadius: '34px', transition: '.4s' }}>
                    <span style={{ position: 'absolute', content: '""', height: '14px', width: '14px', left: '3px', bottom: '3px', backgroundColor: 'white', borderRadius: '50%', transition: '.4s', transform: fiadoAtivo ? 'translateX(20px)' : 'none' }}></span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <QrCode size={18} /> Chaves da Loja
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Chave PIX Principal (CNPJ)</label>
              <input type="text" value="38.123.456/0001-90" readOnly style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-active)', color: 'var(--text-primary)', opacity: 0.8 }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Chave PIX Secundária (Email)</label>
              <input type="text" value="financeiro@hotdogdovini.com.br" readOnly style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-active)', color: 'var(--text-primary)', opacity: 0.8 }} />
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: MAQUININHAS */}
        <div className="vini-glass-panel" style={{ padding: '0', overflow: 'hidden', alignSelf: 'flex-start' }}>
          <div className="section-header" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Smartphone size={18} /> Frota de Maquininhas (POS)
            </h3>
            <button className="vini-btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Adicionar Terminal</button>
          </div>
          
          <div className="table-responsive">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-active)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Equipamento</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Taxa Débito</th>
                  <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Taxa Crédito</th>
                </tr>
              </thead>
              <tbody>
                {maquininhas.map((maq, i) => (
                  <tr key={maq.id} style={{ borderBottom: '1px solid var(--border-color)', opacity: maq.status === 'Manutenção' ? 0.6 : 1 }}>
                    <td style={{ padding: '1rem' }}>
                      <strong style={{ display: 'block' }}>{maq.marca} {maq.modelo}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Serial: {maq.serial}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`vini-badge ${maq.status === 'Ativa' ? 'success' : 'negative'}`}>
                        {maq.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{maq.txDebito}</td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{maq.txCredito}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--bg-surface-elevated)', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
            <AlertCircle size={18} color="var(--c-blue)" style={{ marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: '0 0 0.3rem', fontSize: '0.9rem' }}>Aviso de Conciliação</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Os recebíveis das maquininhas físicas (Stone/PagSeguro) não estão integrados automaticamente na API. Você precisa conciliar os valores fechados na z-out no módulo de CAIXA diariamente.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Pagamentos;
