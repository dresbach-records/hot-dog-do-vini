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
    if (!success.success) {
      alert(success.error);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div style={{
        background: '#161a1f', padding: '2.5rem', borderRadius: '24px',
        width: '400px', border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', textAlign: 'center'
      }}>
        <div style={{
          width: '70px', height: '70px', background: 'rgba(34, 197, 94, 0.1)',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem', border: '1px solid rgba(34, 197, 94, 0.2)'
        }}>
          <DoorOpen size={32} color="#22c55e" />
        </div>

        <h2 style={{ margin: '0 0 0.5rem 0', color: '#fff' }}>Abrir Novo Turno</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Para começar a vender no PDV, informe o valor inicial em fundo de caixa.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ position: 'relative' }}>
             <DollarSign size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
             <input 
               type="number" 
               step="0.01"
               value={valor}
               onChange={(e) => setValor(e.target.value)}
               placeholder="0.00"
               style={{
                 width: '100%', padding: '15px 15px 15px 45px', borderRadius: '12px',
                 background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                 color: '#fff', fontSize: '1.2rem', fontWeight: '700', outline: 'none'
               }}
             />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="vini-btn-primary"
            style={{ padding: '15px', fontSize: '1.1rem' }}
          >
            {loading ? 'Abrindo...' : 'Confirmar e Abrir Caixa'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AbrirCaixaModal;
