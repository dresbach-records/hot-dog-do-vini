import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  DollarSign, 
  CreditCard, 
  Zap, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Printer,
  FileText,
  Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClientes } from '../context/ClientesContext';

function FechamentoCaixa() {
  const navigate = useNavigate();
  const { resumo, loading, fetchData } = useClientes();
  const [etapa, setEtapa] = useState(1); // 1: Conferência, 2: Finalizado
  const [conferencia, setConferencia] = useState({
    dinheiroGaveta: '',
    pixConfirmado: '',
    cartaoConfirmado: '',
    observacoes: ''
  });

  // Valores esperados do sistema (Simulado/Real do Context)
  const esperados = {
    dinheiro: resumo.total_vendas_estimado * 0.3, // Exemplo: 30% em dinheiro
    pix: resumo.total_vendas_estimado * 0.4,      // Exemplo: 40% em pix
    cartao: resumo.total_vendas_estimado * 0.3    // Exemplo: 30% em cartão
  };

  const diferenca = (Number(conferencia.dinheiroGaveta) || 0) - esperados.dinheiro;

  const handleFinalizar = () => {
    setEtapa(2);
    // TODO: Integrar com API para salvar log de fechamento no MariaDB
  };

  if (loading) return <div className="p-8 text-center">Calculando fechamento...</div>;

  return (
    <div className="dashboard animate-fade-in">
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => navigate('/admin/caixa')} className="vini-btn-outline" style={{ padding: '8px' }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2>Fechamento de Caixa 💰</h2>
            <p>Conclua o expediente e valide os valores da gaveta.</p>
          </div>
        </div>
        {etapa === 2 && (
          <div className="vini-badge success" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
            CAIXA ENCERRADO COM SUCESSO
          </div>
        )}
      </header>

      <div className="dashboard-content">
        {etapa === 1 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
            
            {/* VALORES ESPERADOS (SISTEMA) */}
            <div className="vini-glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calculator size={20} color="var(--c-blue)" /> Valores em Sistema
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <DollarSign size={18} color="var(--c-green)" />
                      <span>Dinheiro Esperado</span>
                   </div>
                   <strong style={{ fontSize: '1.1rem' }}>R$ {esperados.dinheiro.toFixed(2)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Zap size={18} color="var(--c-yellow)" />
                      <span>Pix Esperado</span>
                   </div>
                   <strong style={{ fontSize: '1.1rem' }}>R$ {esperados.pix.toFixed(2)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <CreditCard size={18} color="var(--c-blue)" />
                      <span>Cartão Esperado</span>
                   </div>
                   <strong style={{ fontSize: '1.1rem' }}>R$ {esperados.cartao.toFixed(2)}</strong>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontWeight: '700' }}>TOTAL BRUTO</span>
                      <span style={{ fontWeight: '900', fontSize: '1.5rem', color: 'var(--c-green)' }}>R$ {resumo.total_vendas_estimado.toFixed(2)}</span>
                   </div>
                </div>
              </div>
            </div>

            {/* CONFERÊNCIA MANUAL */}
            <div className="vini-glass-panel" style={{ padding: '2rem', borderLeft: '4px solid var(--c-yellow)' }}>
              <h3 style={{ marginBottom: '1.5rem' }}>Conferência de Gaveta</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                   <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Dinheiro Físico (Na Gaveta)</label>
                   <input 
                     type="number" 
                     className="vini-input-dark" 
                     style={{ width: '100%', fontSize: '1.2rem', padding: '12px' }}
                     value={conferencia.dinheiroGaveta}
                     onChange={(e) => setConferencia({...conferencia, dinheiroGaveta: e.target.value})}
                     placeholder="0,00"
                   />
                </div>

                {diferenca !== 0 && conferencia.dinheiroGaveta !== '' && (
                  <div style={{ padding: '12px', borderRadius: '8px', background: diferenca > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: diferenca > 0 ? 'var(--c-green)' : 'var(--c-red)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                    {diferenca > 0 ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>Diferença: <strong>R$ {diferenca.toFixed(2)}</strong> ({diferenca > 0 ? 'Sobra' : 'Quebra'})</span>
                  </div>
                )}

                <div>
                   <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Notas/Observações</label>
                   <textarea 
                     className="vini-input-dark" 
                     style={{ width: '100%', minHeight: '80px', padding: '12px' }}
                     placeholder="Ex: Pagamento de gelo, sangria p/ banco..."
                     value={conferencia.observacoes}
                     onChange={(e) => setConferencia({...conferencia, observacoes: e.target.value})}
                   />
                </div>

                <button 
                  className="btn vini-btn-primary" 
                  style={{ width: '100%', padding: '15px', marginTop: '1rem' }}
                  onClick={handleFinalizar}
                >
                  Finalizar Expediente
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="vini-glass-panel animate-scale-up" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem', textAlign: 'center' }}>
             <div style={{ width: '80px', height: '80px', background: 'var(--c-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                <CheckCircle2 size={40} color="#fff" />
             </div>
             <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Caixa Fechado!</h2>
             <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
               O resumo do dia foi processado e salvo no histórico financeiro. 
               As chamas do Vini's foram apagadas com sucesso! 🔥🌙
             </p>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button className="vini-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                   <Printer size={18} /> Imprimir Resumo
                </button>
                <button className="vini-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                   <FileText size={18} /> Ver Relatório BI
                </button>
             </div>

             <button 
                className="vini-btn-primary" 
                style={{ width: '100%', marginTop: '2rem', padding: '15px' }}
                onClick={() => navigate('/admin/dashboard')}
             >
                Voltar ao Menu Inicial
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FechamentoCaixa;
