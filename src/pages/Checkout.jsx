import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  CreditCard, 
  QrCode, 
  Wallet, 
  Building2, 
  Lock, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  Truck,
  MapPin,
  Clock,
  Ticket,
  ShoppingBag,
  Info
} from 'lucide-react';
import { useClientes } from '../context/ClientesContext';
import api from '../services/api';

const Checkout = ({ session }) => {
  const { clientes, loading: contextLoading } = useClientes();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address] = useState({
    street: 'Rua Miguel Bauer',
    number: '123',
    neighborhood: 'Recreio',
    city: 'Taquara',
    cep: '95600-000'
  });

  const cliente = useMemo(() => {
    return clientes.find(c => c.codigo_vini === session?.user?.id);
  }, [clientes, session]);

  const isConvenioAtivo = cliente?.convenio_status === 'ativo';
  const convenioSaldo = Number(cliente?.convenio_saldo || 0);

  const [cartItems] = useState(() => {
    const saved = localStorage.getItem('vini-cart');
    return saved ? JSON.parse(saved) : [];
  });

  const subtotal = cartItems.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
  const total = subtotal; // Taxa grátis para o Vini

  const paymentOptions = [
    { id: 'cartao', name: 'Cartão de Crédito/Débito', icon: <CreditCard size={22} />, desc: 'Visa, Master e mais' },
    { id: 'pix', name: 'Pix Instantâneo', icon: <QrCode size={22} />, desc: 'Aprovação na hora' },
    { 
      id: 'convenio', 
      name: 'Convênio Corporativo', 
      icon: <Building2 size={22} />, 
      disabled: !isConvenioAtivo,
      desc: isConvenioAtivo ? `Saldo: R$ ${convenioSaldo.toFixed(2).replace('.', ',')}` : 'Solicite ativação'
    }
  ];

  const handleFinish = async () => {
    if (!paymentMethod) {
      alert("Por favor, selecione uma forma de pagamento.");
      return;
    }

    if (paymentMethod === 'convenio' && total > convenioSaldo) {
      alert("Saldo insuficiente no seu convênio corporativo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        cliente: {
          nome: cliente?.nome || 'Cliente Vini',
          email: session?.user?.email,
          id_auth: session?.user?.id
        },
        itens: cartItems,
        endereco: address,
        pagamento: { metodo: paymentMethod },
        total: total
      };

      const result = await api.post('/orders', payload);

      if (result.success) {
        localStorage.removeItem('vini-cart');
        window.location.href = '/cliente/pedidos?success=true';
      } else {
        throw new Error(result.error || "Erro ao processar pedido");
      }
    } catch (err) {
      alert(err.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (contextLoading) return (
     <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA1D2C' }}>
        <strong>Preparando seu Checkout...</strong>
     </div>
  );

  return (
    <div className="vini-checkout-page">
      <header className="vini-checkout-nav">
        <button className="vini-back-circle" onClick={() => window.history.back()}>
          <ArrowLeft size={20} />
        </button>
        <div className="vini-nav-title">
           <h2>Finalizar Pedido</h2>
           <span>{cartItems.length} itens na sacola</span>
        </div>
        <div style={{ width: '40px' }}></div>
      </header>

      <main className="vini-checkout-main">
        <div className="vini-checkout-grid">
           {/* Lado Esquerdo: Detalhes */}
           <div className="vini-checkout-steps">
              
              <section className="vini-checkout-card">
                 <div className="vini-card-header">
                    <MapPin size={20} color="#EA1D2C" />
                    <h3>Endereço de Entrega</h3>
                 </div>
                 <div className="vini-address-box">
                    <div className="vini-address-text">
                       <strong>{address.street}, {address.number}</strong>
                       <p>{address.neighborhood} — {address.city}/RS</p>
                    </div>
                    <button className="vini-text-btn">Alterar</button>
                 </div>
              </section>

              <section className="vini-checkout-card">
                 <div className="vini-card-header">
                    <Clock size={20} color="#EA1D2C" />
                    <h3>Previsão de Entrega</h3>
                 </div>
                 <div className="vini-delivery-info">
                    <div className="vini-time-badge">
                       30 - 45 min
                    </div>
                    <span>Hoje, entre <strong>19:30</strong> e <strong>20:15</strong></span>
                 </div>
              </section>

              <section className="vini-checkout-card">
                 <div className="vini-card-header">
                    <CreditCard size={20} color="#EA1D2C" />
                    <h3>Método de Pagamento</h3>
                 </div>
                 <div className="vini-payment-list">
                    {paymentOptions.map(opt => (
                       <div 
                         key={opt.id} 
                         className={`vini-payment-item ${paymentMethod === opt.id ? 'active' : ''} ${opt.disabled ? 'locked' : ''}`}
                         onClick={() => !opt.disabled && setPaymentMethod(opt.id)}
                       >
                          <div className="vini-pm-icon-wrap">
                             {opt.icon}
                          </div>
                          <div className="vini-pm-content">
                             <div className="vini-pm-name">{opt.name}</div>
                             <div className="vini-pm-desc">{opt.desc}</div>
                          </div>
                          {paymentMethod === opt.id && <CheckCircle2 size={20} color="#22C55E" />}
                          {opt.disabled && <Lock size={18} color="#cbd5e1" />}
                       </div>
                    ))}
                 </div>
              </section>
           </div>

           {/* Lado Direito: Resumo (Sticky em Desktop) */}
           <aside className="vini-checkout-summary">
              <div className="vini-summary-card">
                 <h3 className="vini-summary-title">Resumo do Pedido</h3>
                 <div className="vini-summary-items">
                    {cartItems.map((item, idx) => (
                       <div key={idx} className="vini-summary-item">
                          <span className="vini-si-qty">{item.quantity}x</span>
                          <span className="vini-si-name">{item.title}</span>
                          <span className="vini-si-price">R$ {item.totalPrice.toFixed(2).replace('.', ',')}</span>
                       </div>
                    ))}
                 </div>

                 <div className="vini-summary-divider"></div>

                 <div className="vini-summary-footer">
                    <div className="vini-footer-row">
                       <span>Subtotal</span>
                       <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="vini-footer-row">
                       <span>Taxa de Entrega</span>
                       <span style={{ color: '#22C55E', fontWeight: '800' }}>GRÁTIS</span>
                    </div>
                    <div className="vini-footer-row total">
                       <span>Total</span>
                       <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                    </div>
                 </div>

                 <div className="vini-security-badge">
                    <ShieldCheck size={16} />
                    Pagamento 100% Seguro
                 </div>

                 <button 
                   className="vini-finish-btn" 
                   onClick={handleFinish}
                   disabled={isSubmitting || cartItems.length === 0}
                 >
                    {isSubmitting ? 'Processando...' : 'Confirmar Pedido'}
                 </button>
              </div>
           </aside>
        </div>
      </main>

      <style jsx>{`
        .vini-checkout-page {
          background: #f8fafc;
          min-height: 100vh;
          font-family: 'Outfit', sans-serif;
          color: #1e293b;
        }

        .vini-checkout-nav {
          background: #fff;
          padding: 15px 30px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .vini-back-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .vini-back-circle:hover { background: #f1f5f9; }

        .vini-nav-title { text-align: center; }
        .vini-nav-title h2 { margin: 0; font-size: 18px; font-weight: 800; }
        .vini-nav-title span { font-size: 12px; color: #64748b; font-weight: 500; }

        .vini-checkout-main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 30px 20px;
        }

        .vini-checkout-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 30px;
        }

        @media (max-width: 900px) {
          .vini-checkout-grid { grid-template-columns: 1fr; }
          .vini-checkout-summary { position: fixed; bottom: 0; left: 0; width: 100%; z-index: 200; }
          .vini-summary-card { border-radius: 20px 20px 0 0 !important; box-shadow: 0 -10px 30px rgba(0,0,0,0.1) !important; padding: 20px !important; }
          .vini-summary-items, .vini-summary-title { display: none; }
          .vini-checkout-main { padding-bottom: 200px; }
        }

        .vini-checkout-steps { display: flex; flex-direction: column; gap: 20px; }

        .vini-checkout-card {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          border: 1px solid #f1f5f9;
        }

        .vini-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .vini-card-header h3 { margin: 0; font-size: 16px; font-weight: 800; }

        .vini-address-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fcfcfc;
          padding: 16px;
          border-radius: 14px;
          border: 1px dashed #e2e8f0;
        }
        .vini-address-text strong { display: block; font-size: 15px; margin-bottom: 2px; }
        .vini-address-text p { margin: 0; font-size: 13px; color: #64748b; }
        .vini-text-btn { background: none; border: none; color: #EA1D2C; font-weight: 700; font-size: 13px; cursor: pointer; }

        .vini-delivery-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .vini-time-badge {
          background: #fee2e2;
          color: #EA1D2C;
          padding: 6px 12px;
          border-radius: 10px;
          font-weight: 800;
          font-size: 13px;
        }

        .vini-payment-list { display: flex; flex-direction: column; gap: 12px; }
        .vini-payment-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 16px;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          cursor: pointer;
          transition: all 0.2s;
        }
        .vini-payment-item:hover { border-color: #EA1D2C; }
        .vini-payment-item.active { border-color: #EA1D2C; background: #fff5f5; }
        .vini-payment-item.locked { opacity: 0.5; cursor: not-allowed; background: #f8fafc; }

        .vini-pm-icon-wrap {
          width: 44px;
          height: 44px;
          background: #f1f5f9;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }
        .vini-payment-item.active .vini-pm-icon-wrap { background: #EA1D2C; color: #fff; }

        .vini-pm-content { flex: 1; }
        .vini-pm-name { font-weight: 700; font-size: 14px; }
        .vini-pm-desc { font-size: 12px; color: #94a3b8; }

        .vini-summary-card {
          background: #fff;
          border-radius: 24px;
          padding: 30px;
          position: sticky;
          top: 100px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
        }
        .vini-summary-title { margin: 0 0 20px; font-size: 18px; font-weight: 800; }
        
        .vini-summary-items { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .vini-summary-item { display: flex; align-items: center; font-size: 13px; gap: 8px; }
        .vini-si-qty { font-weight: 800; color: #EA1D2C; }
        .vini-si-name { flex: 1; color: #475569; }
        .vini-si-price { font-weight: 700; }

        .vini-summary-divider { height: 1px; background: #f1f5f9; margin-bottom: 20px; }

        .vini-summary-footer { display: flex; flex-direction: column; gap: 12px; }
        .vini-footer-row { display: flex; justify-content: space-between; font-size: 14px; color: #64748b; }
        .vini-footer-row.total { font-size: 20px; font-weight: 900; color: #1e293b; margin-top: 5px; }

        .vini-security-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #f0fdf4;
          color: #16a34a;
          font-size: 11px;
          font-weight: 700;
          padding: 8px;
          border-radius: 8px;
          margin: 20px 0;
        }

        .vini-finish-btn {
          width: 100%;
          background: #EA1D2C;
          color: #fff;
          border: none;
          padding: 18px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 8px 20px rgba(234, 29, 44, 0.2);
        }
        .vini-finish-btn:hover { background: #d01928; transform: translateY(-2px); }
        .vini-finish-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

      `}</style>
    </div>
  );
};

export default Checkout;
