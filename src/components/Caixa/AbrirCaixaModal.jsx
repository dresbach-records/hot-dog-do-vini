import React, { useState } from 'react';
import { useCaixa } from '../../context/CaixaContext';
import { DoorOpen, DollarSign, X } from 'lucide-react';

const AbrirCaixaModal = () => {
  const { abrirCaixa } = useCaixa();
  const [valor, setValor] = useState('0.00');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await abrirCaixa(parseFloat(valor));
    setLoading(false);
    if (!success?.success) {
      alert(success?.error || 'Erro ao abrir caixa');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: '#fff', padding: '2.5rem', borderRadius: '24px',
        width: '400px', border: '1px solid #e2e8f0',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', textAlign: 'center'
      }}>
        <div style={{
          width: '70px', height: '70px', background: '#dcfce7',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem', border: '1px solid #bbf7d0'
        }}>
          <DoorOpen size={32} color="#166534" />
        </div>

        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: '#0f172a', fontWeight: '800' }}>Abrir Novo Turno</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#64748b' }}>&times;</button>
        </header>

        <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Para começar a vender no PDV, informe o valor inicial em fundo de caixa.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ position: 'relative' }}>
             <DollarSign size={18} color="#94a3b8" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
             <input 
               type="number" 
               step="0.01"
               value={valor}
               onChange={(e) => setValor(e.target.value)}
               placeholder="0.00"
               style={{
                 width: '100%', padding: '15px 15px 15px 45px', borderRadius: '12px',
                 background: '#f8fafc', border: '1px solid #e2e8f0',
                 color: '#0f172a', fontSize: '1.2rem', fontWeight: '700', outline: 'none'
               }}
             />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit"
              disabled={loading}
              className="vini-btn-primary"
              style={{ flex: 1, padding: '18px', fontSize: '1.1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
            >
              {loading ? 'Abrindo...' : 'Confirmar'}
            </button>
            <button 
              type="button" 
              className="vini-btn-outline" 
              style={{ flex: 1, padding: '18px', fontSize: '1.1rem', background: '#fff', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
              onClick={onClose}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AbrirCaixaModal;
