import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  DollarSign, TrendingUp, Calendar, ArrowUpRight, 
  ArrowDownRight, FileText, Download, PieChart, 
  CreditCard, Wallet, Banknote, HelpCircle, 
  Info, ChevronRight
} from 'lucide-react';
import '../styles/admin/dashboard.css';

function FinancasHub() {
  const [stats, setStats] = useState({
    faturamento: 12540.80,
    taxas: 1240.20,
    servicos: 450.00,
    ajustes: -50.00,
    total: 10800.60
  });

  const [repasses, setRepasses] = useState([
    { data: '12/04', valor: 850.20, status: 'agendado' },
    { data: '10/04', valor: 1200.00, status: 'pago' },
    { data: '05/04', valor: 950.40, status: 'pago' }
  ]);

  return (
    <div className="admin-page-container">
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
           <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Financeiro</h1>
           <p style={{ opacity: 0.6 }}>Gerencie seus lucros, repasses e taxas operacionais</p>
        </div>
        <div className="header-actions">
           <button className="vini-btn-outline"><Calendar size={18}/> Este Mês</button>
           <button className="vini-btn-primary"><Download size={18}/> EXPORTAR</button>
        </div>
      </header>

      {/* KPI Cards iFood Style */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '2rem' }}>
         <div className="vini-glass-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '5px' }}>Faturamento</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>R$ {stats.faturamento.toFixed(2)}</div>
         </div>
         <div className="vini-glass-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '5px', color: '#e74c3c' }}>Taxas e comissões</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>- R$ {stats.taxas.toFixed(2)}</div>
         </div>
         <div className="vini-glass-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '5px', color: '#3498db' }}>Serviços e promoções</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>R$ {stats.servicos.toFixed(2)}</div>
         </div>
         <div className="vini-glass-panel" style={{ padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '5px' }}>Ajustes</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>R$ {stats.ajustes.toFixed(2)}</div>
         </div>
         <div className="vini-glass-panel" style={{ padding: '1.2rem', textAlign: 'center', background: '#27ae60', color: '#fff' }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '5px' }}>Total faturamento</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>R$ {stats.total.toFixed(2)}</div>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
         
         {/* LADO ESQUERDO: REPASSES */}
         <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
               <h3 style={{ margin: 0 }}>Repasses do mês</h3>
               <button style={{ background: 'none', border: 'none', color: '#3498db', fontWeight: 700, fontSize: '0.8rem' }}>Ver detalhes</button>
            </div>
            
            <div className="empty-state-repasses" style={{ padding: '3rem', textAlign: 'center', background: '#f9f9f9', borderRadius: '12px', border: '1px dashed #ddd' }}>
               <Banknote size={48} opacity={0.2} style={{ marginBottom: '1rem' }} />
               <p style={{ fontWeight: 600, color: '#666' }}>Aqui fica a lista dos seus repasses</p>
               <p style={{ fontSize: '0.85rem', color: '#999' }}>Em breve aqui aparecerá tudo o que você irá receber pelas suas vendas</p>
            </div>

            <table style={{ width: '100%', marginTop: '2rem', borderCollapse: 'collapse' }}>
               <thead>
                 <tr style={{ textTransform: 'uppercase', fontSize: '0.7rem', color: '#999', textAlign: 'left' }}>
                   <th style={{ padding: '10px' }}>Data Estimada</th>
                   <th>Valor do Repasse</th>
                   <th>Status</th>
                   <th>Ação</th>
                 </tr>
               </thead>
               <tbody>
                 {repasses.map((r, i) => (
                   <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                     <td style={{ padding: '15px 10px' }}>{r.data}</td>
                     <td style={{ fontWeight: 700 }}>R$ {r.valor.toFixed(2)}</td>
                     <td>
                        <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem', background: r.status === 'pago' ? '#e8f6ef' : '#fff4e6', color: r.status === 'pago' ? '#27ae60' : '#f39c12', fontWeight: 700 }}>
                          {r.status.toUpperCase()}
                        </span>
                     </td>
                     <td><button className="btn-circle-outline"><ChevronRight size={14}/></button></td>
                   </tr>
                 ))}
               </tbody>
            </table>
         </div>

         {/* LADO DIREITO: TOOLS & DOCS */}
         <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
               <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1rem' }}>Informações financeiras</h3>
               
               <div className="finance-tool-item" style={{ display: 'flex', gap: '15px', padding: '12px', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.2s' }}>
                  <div style={{ background: '#3498db', color: '#fff', padding: '10px', borderRadius: '8px' }}><FileText size={20}/></div>
                  <div>
                    <strong style={{ display: 'block' }}>Central de arquivos financeiros</strong>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Confira os documentos da sua loja</span>
                  </div>
               </div>

               <div className="finance-tool-item" style={{ display: 'flex', gap: '15px', padding: '12px', borderRadius: '10px', marginTop: '10px' }}>
                  <div style={{ background: '#27ae60', color: '#fff', padding: '10px', borderRadius: '8px' }}><Wallet size={20}/></div>
                  <div>
                    <strong style={{ display: 'block' }}>Depósitos</strong>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Confira os seus depósitos desse mês</span>
                  </div>
               </div>

               <div className="finance-tool-item" style={{ display: 'flex', gap: '15px', padding: '12px', borderRadius: '10px', marginTop: '10px' }}>
                  <div style={{ background: '#f39c12', color: '#fff', padding: '10px', borderRadius: '8px' }}><Banknote size={20}/></div>
                  <div>
                    <strong style={{ display: 'block' }}>Dados bancários e contratuais</strong>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Confira os dados da sua loja</span>
                  </div>
               </div>

               <div className="finance-tool-item" style={{ display: 'flex', gap: '15px', padding: '12px', borderRadius: '10px', marginTop: '10px' }}>
                  <div style={{ background: '#9b59b6', color: '#fff', padding: '10px', borderRadius: '8px' }}><Calendar size={20}/></div>
                  <div>
                    <strong style={{ display: 'block' }}>Frequência de repasse</strong>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Confira as frequências disponíveis</span>
                  </div>
               </div>
            </div>

            <div className="vini-glass-panel" style={{ padding: '1.5rem', background: '#333', color: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Antecipação</h3>
                    <p style={{ margin: 0, opacity: 0.7, fontSize: '0.8rem' }}>Receba suas vendas amanhã</p>
                  </div>
                  <button className="vini-btn-primary" style={{ background: '#fff', color: '#333' }}>Ativar</button>
                </div>
            </div>
         </div>

      </div>
    </div>
  );
}

export default FinancasHub;
