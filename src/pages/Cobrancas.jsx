import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Filter, History, RotateCw, ExternalLink, Trash2, ShieldAlert, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import '../styles/admin/dashboard.css';

function Cobrancas() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
     loadPayments();
  }, []);

  async function loadPayments() {
     setLoading(true);
     try {
        const res = await api.get('/payments/list');
        if (res.success) setPayments(res.payments);
     } catch (err) { console.error(err); }
     finally { setLoading(false); }
  }

  async function viewHistory(payment) {
     setSelectedPayment(payment);
     try {
        const res = await api.get(`/payments/${payment.id}/history`);
        if (res.success) setHistory(res.history);
     } catch (err) { console.error(err); }
  }

  const getStatusColor = (status) => {
     switch (status) {
        case 'RECEIVED': return 'var(--c-green)';
        case 'CONFIRMED': return 'var(--c-blue)';
        case 'OVERDUE': return 'var(--c-red)';
        case 'REFUNDED': return 'var(--c-yellow)';
        case 'CHARGEBACK': return 'var(--c-red)';
        default: return 'var(--text-secondary)';
     }
  };

  return (
    <div className="dashboard-page animate-fade-in" style={{ padding: '1.5rem' }}>
      <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               <CreditCard color="var(--c-blue)" /> Gestão de Cobranças (Auditoria Pro)
            </h2>
            <p className="text-secondary">Rastreabilidade completa de cada centavo via ledger Asaas.</p>
         </div>
         <button className="vini-btn outline-primary" onClick={loadPayments}><RotateCw size={16} /> Sincronizar</button>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: selectedPayment ? '1fr 350px' : '1fr', gap: '1.5rem', transition: 'all 0.3s ease' }}>
         <div className="table-container">
            <div className="table-responsive vini-glass-panel" style={{ padding: '1.5rem', borderRadius: '12px' }}>
               <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                     <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '12px' }}>Vencimento</th>
                        <th>Status</th>
                        <th>Valor</th>
                        <th>Líquido</th>
                        <th>Forma</th>
                        <th style={{ textAlign: 'right', padding: '12px' }}>Audit</th>
                     </tr>
                  </thead>
                  <tbody>
                     {payments.length === 0 ? (
                        <tr>
                           <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                              Nenhum pagamento processado no ledger ainda.
                           </td>
                        </tr>
                     ) : (
                        payments.map(p => (
                           <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }} onClick={() => viewHistory(p)}>
                              <td style={{ padding: '12px' }}>{new Date(p.due_date).toLocaleDateString()}</td>
                              <td>
                                 <span style={{ 
                                    padding: '4px 10px', 
                                    borderRadius: '20px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 'bold',
                                    background: `rgba(${getStatusColor(p.status)}, 0.1)`, 
                                    color: getStatusColor(p.status),
                                    border: `1px solid ${getStatusColor(p.status)}`
                                 }}>
                                    {p.status}
                                 </span>
                              </td>
                              <td>R$ {p.value.toFixed(2)}</td>
                              <td style={{ color: 'var(--c-green)' }}>R$ {p.net_value?.toFixed(2) || '--'}</td>
                              <td>{p.billing_type}</td>
                              <td style={{ textAlign: 'right', padding: '12px' }}>
                                 <button className="icon-btn"><History size={18} /></button>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {selectedPayment && (
            <aside className="vini-glass-panel animate-slide-in-right" style={{ padding: '1.5rem', height: 'fit-content' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0 }}>Timeline: {selectedPayment.asaas_id}</h3>
                  <button onClick={() => setSelectedPayment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>&times;</button>
               </div>
               
               <div className="audit-timeline">
                  {history.length === 0 ? <p>Carregando histórico...</p> : history.map((h, i) => (
                     <div key={h.id} style={{ position: 'relative', paddingLeft: '25px', marginBottom: '1.5rem', borderLeft: '2px solid var(--border-color)' }}>
                        <div style={{ position: 'absolute', left: '-9px', top: '0', padding: '2px', background: 'var(--bg-primary)', borderRadius: '50%' }}>
                           {h.status === 'RECEIVED' ? <CheckCircle size={14} color="var(--c-green)" /> : <Clock size={14} color="var(--text-secondary)" />}
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{h.status}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(h.created_at).toLocaleString()}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--c-blue)' }}>{h.event_type}</div>
                     </div>
                  ))}
               </div>

               <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                     {selectedPayment.bank_slip_url && <a href={selectedPayment.bank_slip_url} target="_blank" className="vini-btn outline-secondary sm"><ExternalLink size={14} /> Boleto</a>}
                     {selectedPayment.invoice_url && <a href={selectedPayment.invoice_url} target="_blank" className="vini-btn outline-secondary sm"><ExternalLink size={14} /> NF-e</a>}
                  </div>
               </div>
            </aside>
         )}
      </section>
    </div>
  );
}

export default Cobrancas;
