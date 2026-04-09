import React, { useState, useEffect } from 'react';
import { 
  Gavel, Plus, FileText, Search, Filter, 
  Download, Eye, Edit, Trash2, CheckCircle, 
  Clock, AlertCircle, Upload, MoreHorizontal
} from 'lucide-react';
import api from '../services/api';
import '../styles/admin/dashboard.css';

function Juridico() {
  const [activeTab, setActiveTab] = useState('contratos');
  const [contracts, setContracts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [fiscalRecords, setFiscalRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'contratos') {
        const res = await api.get('/juridico/contratos');
        if (res.success) setContracts(res.data);
      } else if (activeTab === 'templates') {
        const res = await api.get('/juridico/templates');
        if (res.success) setTemplates(res.data);
      } else if (activeTab === 'documentos') {
        const res = await api.get('/juridico/documentos');
        if (res.success) setDocuments(res.data);
      } else if (activeTab === 'fiscal') {
        const res = await api.get('/juridico/fiscal-records');
        if (res.success) setFiscalRecords(res.data);
      }
    } catch (err) {
      console.error('Erro ao buscar dados jurídicos:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    rascunho: 'var(--c-yellow)',
    vigente: 'var(--c-green)',
    finalizado: 'var(--c-blue)',
    cancelado: 'var(--c-red)'
  };

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '2rem' }}>
      <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Gavel size={32} color="var(--c-red)" /> Gestão Jurídica & Compliance
          </h2>
          <p className="text-secondary">Contratos, termos legais e documentação institucional da empresa.</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'contratos' && (
            <button className="vini-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Novo Contrato
            </button>
          )}
          {activeTab === 'templates' && (
            <button className="vini-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Novo Modelo
            </button>
          )}
          {activeTab === 'fiscal' && (
            <button className="vini-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={18} /> Novo Registro Capital
            </button>
          )}
        </div>
      </header>

      {/* TABS NAVEGAÇÃO */}
      <div className="vini-tabs" style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
        <button 
          onClick={() => setActiveTab('contratos')}
          style={{ 
            padding: '1rem 0', background: 'none', border: 'none', color: activeTab === 'contratos' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'contratos' ? '700' : '400', borderBottom: activeTab === 'contratos' ? '3px solid var(--c-red)' : '3px solid transparent',
            cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s'
          }}
        >
          Contratos Gerados
        </button>
        <button 
          onClick={() => setActiveTab('templates')}
          style={{ 
            padding: '1rem 0', background: 'none', border: 'none', color: activeTab === 'templates' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'templates' ? '700' : '400', borderBottom: activeTab === 'templates' ? '3px solid var(--c-red)' : '3px solid transparent',
            cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s'
          }}
        >
          Modelos (Templates)
        </button>
        <button 
          onClick={() => setActiveTab('documentos')}
          style={{ 
            padding: '1rem 0', background: 'none', border: 'none', color: activeTab === 'documentos' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'documentos' ? '700' : '400', borderBottom: activeTab === 'documentos' ? '3px solid var(--c-red)' : '3px solid transparent',
            cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s'
          }}
        >
          Documentos da Empresa
        </button>
        <button 
          onClick={() => setActiveTab('fiscal')}
          style={{ 
            padding: '1rem 0', background: 'none', border: 'none', color: activeTab === 'fiscal' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'fiscal' ? '700' : '400', borderBottom: activeTab === 'fiscal' ? '3px solid var(--c-red)' : '3px solid transparent',
            cursor: 'pointer', fontSize: '1.1rem', transition: 'all 0.2s'
          }}
        >
          Registros Fiscais (Vendas Manuais)
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center' }}>Carregando dados jurídicos...</div>
      ) : (
        <div className="tab-content">
          {activeTab === 'contratos' && (
            <div className="vini-glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--bg-active)' }}>
                  <tr>
                    <th style={{ padding: '1.2rem', textAlign: 'left' }}>Contrato / Tipo</th>
                    <th style={{ padding: '1.2rem', textAlign: 'left' }}>Parte B (Beneficiário)</th>
                    <th style={{ padding: '1.2rem', textAlign: 'left' }}>Data Criação</th>
                    <th style={{ padding: '1.2rem', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '1.2rem', textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map(contract => (
                    <tr key={contract.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <FileText size={20} color="var(--text-secondary)" />
                          <div>
                            <strong style={{ display: 'block' }}>{contract.template_nome || 'Sem Categoria'}</strong>
                            <small style={{ opacity: 0.6 }}>{contract.tipo.replace('_', ' ')}</small>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem' }}>
                        <div>
                          <strong>{contract.nome_parte_B || 'Não Identificado'}</strong>
                          <br />
                          <small style={{ opacity: 0.6 }}>{contract.documento_parte_B}</small>
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem' }}>{new Date(contract.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '1.2rem' }}>
                        <span className="vini-badge" style={{ 
                          backgroundColor: `${statusColors[contract.status]}15`, 
                          color: statusColors[contract.status],
                          border: `1px solid ${statusColors[contract.status]}30`
                        }}>
                          {contract.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button className="vini-btn-outline icon-only" title="Visualizar"><Eye size={16} /></button>
                          <button className="vini-btn-outline icon-only" title="Baixar PDF"><Download size={16} /></button>
                          <button className="vini-btn-outline icon-only" title="Assinar"><CheckCircle size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {contracts.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                        Nenhum contrato gerado até o momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="grid-templates" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {templates.map(tpl => (
                <div key={tpl.id} className="vini-glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{tpl.nome}</h4>
                    <span className="vini-badge secondary" style={{ marginBottom: '1rem' }}>{tpl.tipo.toUpperCase()}</span>
                    <p style={{ opacity: 0.7, fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {tpl.conteudo}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                    <button className="vini-btn-primary" style={{ flex: 1, fontSize: '0.9rem' }}><Edit size={14} /> Editar</button>
                    <button className="vini-btn-outline icon-only"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
              {templates.length === 0 && (
                 <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                    Nenhum modelo de contrato cadastrado.
                 </div>
              )}
            </div>
          )}

          {activeTab === 'documentos' && (
            <div className="grid-docs" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {documents.map(doc => (
                <div key={doc.id} className="vini-glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-active)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={24} color="var(--c-red)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0 }}>{doc.nome}</h4>
                    <small style={{ opacity: 0.6 }}>Tipo: {doc.tipo}</small>
                    {doc.data_vencimento && (
                       <div style={{ marginTop: '5px', color: 'var(--c-yellow)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <AlertCircle size={12} /> Vence em: {new Date(doc.data_vencimento).toLocaleDateString()}
                       </div>
                    )}
                  </div>
                  <button className="vini-btn-outline icon-only"><Download size={16} /></button>
                </div>
              ))}
              {documents.length === 0 && (
                <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                   Nenhum documento institucional arquivado.
                </div>
              )}
            </div>
          )}

          {activeTab === 'fiscal' && (
            <div className="vini-glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'var(--bg-active)' }}>
                  <tr>
                    <th style={{ padding: '1.2rem', textAlign: 'left' }}>Data</th>
                    <th style={{ padding: '1.2rem', textAlign: 'left' }}>Descrição / NF</th>
                    <th style={{ padding: '1.2rem', textAlign: 'left' }}>Forma Pagto</th>
                    <th style={{ padding: '1.2rem', textAlign: 'right' }}>Valor Total</th>
                    <th style={{ padding: '1.2rem', textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {fiscalRecords.map(rec => (
                    <tr key={rec.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1.2rem' }}>{new Date(rec.data_venda).toLocaleDateString()}</td>
                      <td style={{ padding: '1.2rem' }}>
                        <div>
                          <strong>{rec.descricao}</strong>
                          {rec.nota_fiscal_vinculada && (
                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>NF: {rec.nota_fiscal_vinculada}</div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem' }}>{rec.forma_pagamento}</td>
                      <td style={{ padding: '1.2rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--c-green)' }}>
                        R$ {Number(rec.valor_total).toFixed(2).replace('.', ',')}
                      </td>
                      <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                        <button className="vini-btn-outline icon-only"><Download size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {fiscalRecords.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>
                        Nenhum registro de venda manual encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Juridico;
