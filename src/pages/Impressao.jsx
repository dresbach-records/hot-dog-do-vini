import React, { useState } from 'react';
import { 
  Printer, Settings, Plus, Trash2, 
  CheckCircle2, AlertCircle, Info,
  Power, RefreshCw, Send, Terminal
} from 'lucide-react';
import '../styles/admin/dashboard.css';

function Impressao() {
  const [printers, setPrinters] = useState([
    { id: 1, nome: 'Cozinha Principal', tipo: 'Termica 80mm', status: 'online', ip: '192.168.1.150', destinos: ['lanches', 'porcoes'] },
    { id: 2, nome: 'Bar / Bebidas', tipo: 'Termica 58mm', status: 'online', ip: '192.168.1.151', destinos: ['bebidas', 'sucos'] },
    { id: 3, nome: 'Balcão / Caixa', tipo: 'Termica 80mm', status: 'offline', ip: 'USB-PORT-01', destinos: ['comprovantes', 'cupom_fiscal'] }
  ]);

  return (
    <div className="admin-page-container">
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
           <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Impressão</h1>
           <p style={{ opacity: 0.6 }}>Configure suas impressoras térmicas e destinos de produção</p>
        </div>
        <div className="header-actions">
           <button className="vini-btn-outline"><RefreshCw size={18}/> TESTAR CONEXÃO</button>
           <button className="vini-btn-primary"><Plus size={18}/> ADICIONAR IMPRESSORA</button>
        </div>
      </header>

      {/* Connectivity Alert */}
      <div style={{ background: '#fcedda', color: '#f39c12', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
         <AlertCircle size={20}/>
         <div style={{ fontSize: '0.9rem' }}>
            <strong>Hub de Impressão Ativo:</strong> Certifique-se de que o <strong>ViniPrint Desktop</strong> esteja rodando no computador local para comunicação direta com as portas USB/IP.
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
         {printers.map(printer => (
            <div key={printer.id} className="vini-glass-panel" style={{ padding: '1.5rem', border: printer.status === 'online' ? '1px solid #e8f6ef' : '1px solid #fff5f5' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ background: printer.status === 'online' ? '#27ae60' : '#e74c3c', color: '#fff', padding: '10px', borderRadius: '10px' }}>
                    <Printer size={20}/>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                     <button className="btn-circle-outline"><Settings size={14}/></button>
                     <button className="btn-circle-outline" style={{ color: 'red' }}><Trash2 size={14}/></button>
                  </div>
               </div>
               
               <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ fontSize: '1.1rem', display: 'block' }}>{printer.nome}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#888' }}>{printer.tipo} • {printer.ip}</span>
               </div>

               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '1.5rem' }}>
                  {printer.destinos.map(dest => (
                    <span key={dest} style={{ padding: '3px 8px', background: '#eee', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>{dest}</span>
                  ))}
               </div>

               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #f9f9f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <div style={{ width: '8px', height: '8px', background: printer.status === 'online' ? '#27ae60' : '#e74c3c', borderRadius: '50%' }}></div>
                     <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize' }}>{printer.status}</span>
                  </div>
                  <button className="vini-btn-outline" style={{ padding: '5px 15px', fontSize: '0.75rem' }}>IMPRIMIR TESTE</button>
               </div>
            </div>
         ))}
      </div>

      {/* Advanced Settings */}
      <div className="vini-glass-panel" style={{ padding: '2rem' }}>
         <h3 style={{ margin: '0 0 2rem 0' }}>Configurações de Layout</h3>
         
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            <div>
               <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>TAMANHO DA FONTE (PRODUÇÃO)</label>
                  <select className="vini-input">
                     <option>Padrão (12pt)</option>
                     <option>Grande (16pt)</option>
                     <option>Extra Grande (20pt)</option>
                  </select>
               </div>
               <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>DETALHES DA COMANDA</label>
                  <div style={{ display: 'grid', gap: '10px' }}>
                     <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked /> <span style={{ fontSize: '0.9rem' }}>Mostrar itens adicionais em negrito</span>
                     </label>
                     <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" defaultChecked /> <span style={{ fontSize: '0.9rem' }}>Imprimir QR Code do pedido</span>
                     </label>
                     <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" /> <span style={{ fontSize: '0.9rem' }}>Resumir itens repetidos (2x Item)</span>
                     </label>
                  </div>
               </div>
            </div>

            <div style={{ background: '#333', color: '#fff', padding: '1.5rem', borderRadius: '12px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                  <Terminal size={18} color="#27ae60"/>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>PREVIEW DA COMANDA</span>
               </div>
               <div style={{ background: '#fff', color: '#000', padding: '1rem', fontFamily: 'monospace', fontSize: '10px', minHeight: '150px' }}>
                  <center><strong>HOT DOG DO VINI</strong><br/>Pedido #1234 - Delivery</center>
                  <hr/>
                  1x HOT DOG MESTRE<br/>
                  --- S/ Cebola<br/>
                  --- + Queijo Extra<br/>
                  <br/>
                  <strong>TOTAL: R$ 32,90</strong>
                  <hr/>
                  <center>Impresso em 12/04 20:45</center>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}

export default Impressao;
