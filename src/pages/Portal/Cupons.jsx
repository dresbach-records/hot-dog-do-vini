import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Copy, 
  Check, 
  ArrowLeft,
  Clock,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const Cupons = ({ session }) => {
  const [cupons, setCupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    const fetchCupons = async () => {
      const { data, error } = await supabase
        .from('cupons')
        .select('*')
        .eq('ativo', true)
        .or(`validade.is.null,validade.gt.${new Date().toISOString()}`);

      if (!error) setCupons(data);
      setLoading(false);
    };

    fetchCupons();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div className="vini-cupons-loading">Carregando cupons...</div>;

  return (
    <div className="vini-cupons-container">
      <header className="vini-cupons-header">
        <button onClick={() => window.history.back()} className="vini-back-btn">
          <ArrowLeft size={24} />
        </button>
        <h1 className="vini-cupons-title">Meus Cupons</h1>
      </header>

      <main className="vini-cupons-content">
        <div className="vini-coupon-input-box">
           <input type="text" placeholder="Código do cupom..." />
           <button>ADICIONAR</button>
        </div>

        {cupons.length === 0 ? (
          <div className="vini-empty-state">
            <Ticket size={64} color="#eee" />
            <p>Nenhum cupom disponível no momento</p>
          </div>
        ) : (
          <div className="vini-cupons-grid">
            {cupons.map(cupom => (
              <div key={cupom.id} className="vini-coupon-card">
                 <div className="vini-coupon-left">
                    <div className="vini-coupon-amount">
                       {cupom.desconto_percentual ? `${Math.floor(cupom.desconto_percentual)}%` : `R$ ${Math.floor(cupom.desconto_valor)}`}
                    </div>
                    <div className="vini-coupon-off">OFF</div>
                 </div>
                 <div className="vini-coupon-right">
                    <div className="vini-coupon-info">
                       <h4 className="vini-coupon-code">{cupom.codigo}</h4>
                       <p className="vini-coupon-desc">Válido em todos os produtos do Vini's</p>
                    </div>
                    <button 
                      className={`vini-btn-copy ${copied === cupom.codigo ? 'success' : ''}`}
                      onClick={() => handleCopy(cupom.codigo)}
                    >
                       {copied === cupom.codigo ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> COPIAR</>}
                    </button>
                 </div>
                 {cupom.validade && (
                   <div className="vini-coupon-expiry">
                      <Clock size={12} /> Expira em: {new Date(cupom.validade).toLocaleDateString('pt-BR')}
                   </div>
                 )}
              </div>
            ))}
          </div>
        )}

        <div className="vini-info-box">
           <AlertCircle size={18} color="#999" />
           <p>Os cupons não são cumulativos. Verifique a validade e as regras de cada promoção antes de finalizar seu pedido.</p>
        </div>
      </main>

      <style jsx>{`
        .vini-cupons-container { min-height: 100vh; background: #f8f8fb; }
        .vini-cupons-header { background: #fff; padding: 20px; display: flex; align-items: center; gap: 20px; border-bottom: 1px solid #f0f0f0; }
        .vini-cupons-title { margin: 0; font-size: 20px; font-weight: 800; }
        
        .vini-cupons-content { max-width: 500px; margin: 0 auto; padding: 30px 20px; }
        
        .vini-coupon-input-box { background: #fff; border-radius: 16px; padding: 10px 15px; display: flex; gap: 10px; margin-bottom: 40px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f0f0f0; }
        .vini-coupon-input-box input { flex: 1; border: none; font-size: 14px; font-weight: 600; text-transform: uppercase; }
        .vini-coupon-input-box input:focus { outline: none; }
        .vini-coupon-input-box button { background: none; border: none; color: var(--p-red, #EA1D2C); font-weight: 800; font-size: 13px; cursor: pointer; }
        
        .vini-coupon-card { background: #fff; border-radius: 20px; overflow: hidden; display: flex; margin-bottom: 20px; border: 1px solid #f0f0f0; position: relative; border-left: 5px solid var(--p-red, #EA1D2C); transition: transform 0.2s; }
        .vini-coupon-card:hover { transform: translateY(-3px); }
        
        .vini-coupon-left { width: 90px; background: #fef2f2; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px; border-right: 2px dashed #eee; }
        .vini-coupon-amount { font-size: 24px; font-weight: 900; color: var(--p-red, #EA1D2C); }
        .vini-coupon-off { font-size: 10px; font-weight: 800; color: #999; letter-spacing: 1px; }
        
        .vini-coupon-right { flex: 1; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; }
        .vini-coupon-info { margin-bottom: 10px; }
        .vini-coupon-code { margin: 0; font-size: 18px; font-weight: 900; color: #333; }
        .vini-coupon-desc { font-size: 12px; color: #999; margin: 4px 0 0; }
        
        .vini-btn-copy { background: #f5f5f5; border: none; border-radius: 8px; padding: 8px 15px; font-size: 11px; font-weight: 900; color: #666; display: flex; align-items: center; gap: 6px; cursor: pointer; width: fit-content; transition: all 0.2s; }
        .vini-btn-copy:hover { background: #eee; }
        .vini-btn-copy.success { background: #22C55E; color: #fff; }
        
        .vini-coupon-expiry { position: absolute; right: 15px; top: 10px; font-size: 10px; color: #ccc; font-weight: 600; display: flex; align-items: center; gap: 4px; }
        
        .vini-info-box { margin-top: 50px; display: flex; gap: 12px; font-size: 12px; color: #999; line-height: 1.6; }
      `}</style>
    </div>
  );
};

export default Cupons;
