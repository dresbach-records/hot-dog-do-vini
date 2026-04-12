import React, { useState, useEffect } from 'react';
import { 
  Shield, FileText, Scale, 
  Plus, Download, CheckCircle, 
  Clock, AlertCircle, FileUp, 
  Trash2, Edit, ExternalLink, X,
  Briefcase, FileCheck, ClipboardList,
  Receipt, Landmark
} from 'lucide-react';
import api from '../services/api';
import '../styles/admin/dashboard.css';

function Juridico() {
  const [activeTab, setActiveTab] = useState('contracts');
  const [contracts, setContracts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [fiscalRecords, setFiscalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'contracts') {
        const res = await api.get('/juridico/contracts');
        if (res.success) setContracts(res.data);
      } else if (activeTab === 'templates') {
        const res = await api.get('/juridico/templates');
        if (res.success) setTemplates(res.data);
      } else if (activeTab === 'documents') {
        const res = await api.get('/juridico/documents');
        if (res.success) setDocuments(res.data);
      } else if (activeTab === 'fiscal') {
        // Aproveitando o mesmo hub para registros fiscais
        const res = await api.get('/juridico/fiscal-sales');
        if (res.success) setFiscalRecords(res.data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados jurídicos/fiscais:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    rascunho: { bg: '#fef9c3', text: '#854d0e' },
    vigente: { bg: '#dcfce7', text: '#166534' },
    assinado: { bg: '#dcfce7', text: '#166534' },
    cancelado: { bg: '#fee2e2', text: '#991b1b' }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '';
      if (activeTab === 'contracts') endpoint = '/juridico/contracts';
      else if (activeTab === 'templates') endpoint = '/juridico/templates';
      else if (activeTab === 'documents') endpoint = '/juridico/documents';
      else endpoint = '/juridico/fiscal-sales';

      const res = await api.post(endpoint, formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({});
        fetchData();
      }
    } catch (error) {
      alert('Erro ao salvar registro');
    }
  };

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
      <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield color="#ef4444" size={32} /> Jurídico & Compliance
          </h2>
          <p className="text-secondary">Gestão centralizada de contratos, alvarás e registros fiscais de auditoria.</p>
        </div>
        <button className="vini-btn-primary" onClick={() => { setFormData({}); setIsModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#4f46e5', borderColor: '#4f46e5' }}>
          <Plus size={18} /> Novo Registro
        </button>
      </header>

      {/* TABS NAVEGAÇÃO PRO */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0' }}>
         {[
           { id: 'contracts', label: 'Contratos', icon: <FileText size={18} /> },
           { id: 'documents', label: 'Documentos & Alvarás', icon: <Scale size={18} /> },
           { id: 'templates', label: 'Modelos (Templates)', icon: <ClipboardList size={18} /> },
           { id: 'fiscal', label: 'Registros Fiscais', icon: <Receipt size={18} /> }
         ].map(tab => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             style={{ 
               padding: '1rem 0', background: 'none', border: 'none', fontWeight: 'bold', 
               color: activeTab === tab.id ? '#4f46e5' : '#64748b', 
               borderBottom: activeTab === tab.id ? '2px solid #4f46e5' : '2px solid transparent', 
               cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' 
             }}
           >
             {tab.icon} {tab.label}
           </button>
         ))}
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Sincronizando registros industriais...</div>
      ) : (
        <>
          {activeTab === 'contracts' && (
            <div className="vini-glass-panel" style={{ padding: 0, overflow: 'hidden', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Parte B / Beneficiário</th>
                    <th style={{ textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Tipo</th>
                    <th style={{ textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Data</th>
                    <th style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{c.nome_parte_B}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.documento_parte_B}</div>
                      </td>
                      <td style={{ fontSize: '0.9rem' }}>{c.tipo}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', 
                          background: statusColors[c.status]?.bg || '#f1f5f9', 
                          color: statusColors[c.status]?.text || '#475569' 
                        }}>
                          {c.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="vini-btn-action secondary"><Download size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {contracts.length === 0 && <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Nenhum contrato localizado.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'documents' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {documents.map(doc => (
                <div key={doc.id} className="vini-glass-panel" style={{ padding: '1.5rem', background: '#fff', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                     <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileCheck size={20} color="#4f46e5" />
                     </div>
                     <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 'bold' }}>
                        EXPIRA EM: {new Date(doc.data_vencimento).toLocaleDateString()}
                     </div>
                  </div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#1e293b' }}>{doc.nome}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem' }}>{doc.tipo}</p>
                  <button className="vini-btn" style={{ width: '100%', background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', fontSize: '0.8rem', fontWeight: '800' }}>VER DOCUMENTO</button>
                </div>
              ))}
              {documents.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: '#64748b' }}>Nenhum alvará ou licença arquivada.</div>}
            </div>
          )}

          {activeTab === 'fiscal' && (
            <div className="vini-glass-panel" style={{ padding: 0, overflow: 'hidden', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Data da Venda</th>
                    <th style={{ textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Descrição / NF</th>
                    <th style={{ textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Forma Pagto</th>
                    <th style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Valor Bruto</th>
                    <th style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {fiscalRecords.map(rec => (
                    <tr key={rec.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1.2rem', color: '#1e293b' }}>{new Date(rec.data_venda).toLocaleDateString()}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{rec.descricao}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>NF: {rec.nota_fiscal_vinculada || 'N/A'}</div>
                      </td>
                      <td>{rec.forma_pagamento}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#166534' }}>
                        R$ {Number(rec.valor_total).toFixed(2).replace('.', ',')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                         <button className="icon-btn" style={{ color: '#94a3b8' }}><MoreHorizontal size={18} /></button>
                      </td>
                    </tr>
                  ))}
                  {fiscalRecords.length === 0 && <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Nenhum registro de venda manual para auditoria.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'templates' && (
             <div className="vini-glass-panel" style={{ padding: 0, overflow: 'hidden', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                   <thead style={{ background: '#f8fafc' }}>
                      <tr>
                         <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Nome do Modelo</th>
                         <th style={{ textAlign: 'left', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Tipo Legal</th>
                         <th style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Ações</th>
                      </tr>
                   </thead>
                   <tbody>
                      {templates.map(t => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                           <td style={{ padding: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>{t.nome}</td>
                           <td style={{ fontSize: '0.9rem' }}>{t.tipo}</td>
                           <td style={{ textAlign: 'center' }}>
                             <button className="vini-btn-action secondary"><Edit size={16} /></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          )}
        </>
      )}

      {/* MODAL JURIDICO / FISCAL UNIFICADO */}
      {isModalOpen && (
        <div className="vini-modal-overlay">
           <div className="vini-modal-content" style={{ maxWidth: '500px', background: '#fff', padding: '2rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                 <h3 style={{ margin: 0, color: '#1e293b' }}>Novo Registro</h3>
                 <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X /></button>
              </div>
              
              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 {(activeTab === 'contracts' || activeTab === 'documents' || activeTab === 'templates') && (
                   <input placeholder="Título / Nome" required onChange={e => setFormData({...formData, nome: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                 )}
                 
                 {activeTab === 'fiscal' && (
                    <>
                       <input type="date" placeholder="Data da Venda" required onChange={e => setFormData({...formData, data_venda: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                       <input placeholder="Descrição da Venda" required onChange={e => setFormData({...formData, descricao: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                       <input type="number" step="0.01" placeholder="Valor Total (R$)" required onChange={e => setFormData({...formData, valor_total: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                       <select onChange={e => setFormData({...formData, forma_pagamento: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <option value="Dinheiro">Dinheiro</option>
                          <option value="Pix">Pix</option>
                          <option value="Cartão">Cartão</option>
                       </select>
                       <input placeholder="NF Vinculada (Opcional)" onChange={e => setFormData({...formData, nota_fiscal_vinculada: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </>
                 )}

                 {activeTab === 'contracts' && (
                    <>
                      <input placeholder="Parte B (Ex: Nome do Entregador)" required onChange={e => setFormData({...formData, nome_parte_B: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <input placeholder="Documento da Parte B" required onChange={e => setFormData({...formData, documento_parte_B: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </>
                 )}

                 <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem' }}>
                    <button type="submit" className="vini-btn-primary" style={{ flex: 1, background: '#4f46e5', borderColor: '#4f46e5' }}>Salvar Registro</button>
                    <button type="button" className="vini-btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

export default Juridico;
