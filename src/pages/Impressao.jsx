import React, { useState } from 'react';
import { 
  Printer, 
  Settings, 
  CheckCircle2, 
  RefreshCw, 
  FileText, 
  Zap, 
  Layout, 
  ArrowRight,
  HardDrive
} from 'lucide-react';

function Impressao() {
  const [printerConfig, setPrinterConfig] = useState({
    autoPrint: true,
    paperSize: '80mm',
    numCopies: 1,
    showCustomerPoints: true,
    printLogo: true
  });

  const handleToggle = (key) => {
    setPrinterConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrintTest = () => {
    window.print();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ background: 'var(--c-blue)', padding: '10px', borderRadius: '12px' }}>
            <Printer size={24} color="#fff" />
          </div>
          <div>
            <h2>Configuração de Impressora 🖨️</h2>
            <p>Gerencie sua impressora térmica e automação de comandas de cozinha.</p>
          </div>
        </div>
        <div className="vini-glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid var(--c-green)' }}>
          <HardDrive size={18} color="var(--c-green)" />
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--c-green)' }}>DRIVER GP IFOOD DETECTADO</span>
        </div>
      </header>

      <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' }}>
        
        {/* LADO ESQUERDO: CONFIGURAÇÕES DE HARDWARE */}
        <div className="vini-glass-panel" style={{ padding: '2rem' }}>
          
          <div className="config-section" style={{ marginBottom: '3rem' }}>
             <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={20} color="var(--c-yellow)" /> Automação de Fluxo
             </h3>
             
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>Auto-Print Estilo iFood</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Imprimir comanda automaticamente ao mover pedido para "Em Preparo".</p>
                </div>
                <label className="vini-switch">
                  <input type="checkbox" checked={printerConfig.autoPrint} onChange={() => handleToggle('autoPrint')} />
                  <span className="vini-slider"></span>
                </label>
             </div>
          </div>

          <div className="config-section">
             <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layout size={20} color="var(--c-blue)" /> Layout da Comanda
             </h3>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                   <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem' }}>Tamanho do Papel (Bobina)</label>
                   <select className="vini-input-dark" style={{ width: '100%' }} value={printerConfig.paperSize} onChange={(e) => setPrinterConfig({...printerConfig, paperSize: e.target.value})}>
                      <option value="80mm">80mm (Padrão Largo)</option>
                      <option value="58mm">58mm (Estrito)</option>
                   </select>
                </div>
                <div className="form-group">
                   <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem' }}>Vias por Pedido</label>
                   <select className="vini-input-dark" style={{ width: '100%' }} value={printerConfig.numCopies} onChange={(e) => setPrinterConfig({...printerConfig, numCopies: Number(e.target.value)})}>
                      <option value={1}>1 Via (Cozinha)</option>
                      <option value={2}>2 Vias (Cozinha + Entrega)</option>
                   </select>
                </div>
             </div>

             <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontSize: '0.9rem' }}>Imprimir Logo Vini's (B&W)</span>
                   <input type="checkbox" checked={printerConfig.printLogo} onChange={() => handleToggle('printLogo')} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontSize: '0.9rem' }}>Mostrar Pontos de Fidelidade</span>
                   <input type="checkbox" checked={printerConfig.showCustomerPoints} onChange={() => handleToggle('showCustomerPoints')} />
                </div>
             </div>
          </div>

          <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem', display: 'flex', gap: '1rem' }}>
             <button className="vini-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '10px' }} onClick={handlePrintTest}>
                <FileText size={18} /> Imprimir Comanda de Teste
             </button>
             <button className="btn vini-btn-primary" style={{ flex: 1 }}>Salvar Configurações</button>
          </div>
        </div>

        {/* LADO DIREITO: PREVIEW DA COMANDA */}
        <div style={{ position: 'sticky', top: '2rem' }}>
           <h3 style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1rem', textAlign: 'center' }}>PRÉ-VISUALIZAÇÃO (80mm)</h3>
           <div className="thermal-receipt-preview">
              <div className="receipt-header">
                 {printerConfig.printLogo && <h1 style={{ fontSize: '1.2rem', fontWeight: '900', margin: '0' }}>VINI'S HOT DOG 🔥</h1>}
                 <p style={{ fontSize: '0.8rem', margin: '5px 0' }}>CNPJ: 63.073.948/0001-97</p>
                 <div style={{ borderTop: '2px dashed #000', margin: '10px 0' }}></div>
              </div>
              
              <div className="receipt-body">
                 <h2 style={{ fontSize: '1.5rem', fontWeight: '900', textAlign: 'center', margin: '10px 0' }}>PEDIDO #1024</h2>
                 <p style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span>Data: 05/04/2026</span>
                    <span>Hora: 17:45</span>
                 </p>
                 <div style={{ borderTop: '1px solid #000', margin: '10px 0' }}></div>
                 
                 <div className="receipt-items" style={{ fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                       <span>1x HOT DOG COMPLETO</span>
                       <span>R$ 22,00</span>
                    </div>
                    <p style={{ margin: '2px 0 10px 20px', fontSize: '0.8rem', fontStyle: 'italic' }}>
                       - Sem cebola<br />
                       - Extra milho
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                       <span>1x COCA-COLA 350ML</span>
                       <span>R$ 6,00</span>
                    </div>
                 </div>

                 <div style={{ borderTop: '2px dashed #000', margin: '20px 0' }}></div>
                 
                 <div className="receipt-customer">
                    <p style={{ margin: '0', fontWeight: '800' }}>CLIENTE: MARCOS</p>
                    <p style={{ margin: '5px 0' }}>END: Rua das Flores, 123</p>
                    <p style={{ margin: '5px 0' }}>BAIRRO: Centro, IGREJINHA</p>
                 </div>

                 {printerConfig.showCustomerPoints && (
                   <div style={{ background: '#eee', padding: '10px', marginTop: '15px', borderRadius: '4px', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700' }}>MEUS PONTOS FIDELIDADE: 85 PTS</p>
                   </div>
                 )}
              </div>

              <div className="receipt-footer" style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.75rem' }}>
                 <p>Feito com ❤️ no Hot Dog do Vini</p>
                 <p>vini-delivery.vercel.app</p>
              </div>
           </div>
        </div>

      </div>

      <style>{`
        .thermal-receipt-preview {
          background: #fff;
          color: #000;
          width: 320px;
          min-height: 500px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          font-family: 'Courier New', Courier, monospace;
          margin: 0 auto;
          position: relative;
        }
        .thermal-receipt-preview::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 10px;
          background: linear-gradient(-45deg, #fff 5px, transparent 0), linear-gradient(45deg, #fff 5px, transparent 0);
          background-size: 10px 10px;
          transform: translateY(5px);
        }

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
        input:checked + .vini-slider { background-color: var(--c-green); }
        input:checked + .vini-slider:before { transform: translateX(26px); }
      `}</style>

      {/* COMPONENTE DE IMPRESSÃO REAL (APENAS @media print) */}
      <div className="printable-comanda-hidden" style={{ display: 'none' }}>
         {/* O conteúdo aqui é gerado para o Window.print() */}
      </div>
    </div>
  );
}

export default Impressao;
