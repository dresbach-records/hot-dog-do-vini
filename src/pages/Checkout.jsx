import React, { useState } from 'react';
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
  Ticket
} from 'lucide-react';
import { useClientes } from '../context/ClientesContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Checkout = ({ session }) => {
  const { clientes, loading: contextLoading } = useClientes();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [address, setAddress] = useState({
    street: 'Rua Miguel Bauer',
    number: '123',
    neighborhood: 'Recreio',
    city: 'Taquara/RS'
  });

  const cliente = clientes.find(c => c.codigo_vini === session?.user?.id);
  const isConvenioAtivo = cliente?.convenio_status === 'ativo';
  const convenioSaldo = Number(cliente?.convenio_saldo || 0);

  const [cartItems] = useState(() => {
    const saved = localStorage.getItem('vini-cart');
    return saved ? JSON.parse(saved) : [];
  });

  const subtotal = cartItems.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
  const taxaEntrega = 0; // Grátis por enquanto
  const total = subtotal + taxaEntrega;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paymentOptions = [
    { id: 'cartao', name: 'Cartão de Crédito/Débito', icon: <CreditCard size={24} />, disabled: false },
    { id: 'pix', name: 'Pix (Pagamento Instantâneo)', icon: <QrCode size={24} />, disabled: false },
    { id: 'va', name: 'Vale Alimentação', icon: <Wallet size={24} />, disabled: false },
    { 
      id: 'convenio', 
      name: 'Convênio Corporativo', 
      icon: <Building2 size={24} />, 
      disabled: !isConvenioAtivo,
      badge: !isConvenioAtivo ? 'Não Ativo' : `Saldo: R$ ${convenioSaldo.toFixed(2)}`
    }
  ];

  const handleFinish = async () => {
    if (!paymentMethod) {
      alert("Selecione um método de pagamento.");
      return;
    }

    if (paymentMethod === 'convenio' && total > convenioSaldo) {
      alert("Saldo insuficiente no convênio.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Criar o pedido
      const { data: pedido, error: errPedido } = await supabase
        .from('pedidos')
        .insert({
          cliente_id: cliente.id,
          plataforma: 'vinis',
          status: 'pendente',
          tipo_entrega: 'delivery_proprio',
          endereco_entrega: address,
          forma_pagamento: paymentMethod,
          total: total,
          taxa_entrega: taxaEntrega,
          itens: cartItems,
          codigo_pedido_curto: `#${Math.floor(Math.random() * 9000) + 1000}`
        })
        .select()
        .single();

      if (errPedido) throw errPedido;

      // 2. Se for convênio, debitar saldo (Opcional se houver trigger, mas vamos garantir)
      if (paymentMethod === 'convenio') {
         const { error: errSaldo } = await supabase
           .from('clientes')
           .update({ 
             convenio_saldo: convenioSaldo - total,
             total_cliente: Number(cliente.total_cliente) + total 
           })
           .eq('id', cliente.id);
         
         if (errSaldo) console.error("Erro ao debitar saldo:", errSaldo);
      }

      // 3. Limpar carrinho
      localStorage.removeItem('vini-cart');
      
      alert("Pedido realizado com sucesso!");
      window.location.href = '/cliente/pedidos';
    } catch (err) {
      console.error(err);
      alert("Erro ao processar pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vini-checkout-container">
      <header className="vini-checkout-header">
        <button className="vini-back-btn" onClick={() => window.history.back()}>
          <ArrowLeft size={24} />
        </button>
        <span className="vini-checkout-header-title">Finalizar Pedido</span>
        <div style={{ width: '24px' }}></div>
      </header>

      <main className="vini-checkout-content">
        <div className="vini-checkout-steps">
          {/* Section: Entrega */}
          <section className="vini-checkout-section">
            <div className="vini-section-header">
              <Truck size={20} color="var(--p-red)" />
              <h3>Endereço de Entrega</h3>
            </div>
            <div className="vini-address-card">
              <MapPin size={24} color="#999" />
              <div className="vini-address-info">
                <span>{address.street}, {address.number}</span>
                <p>{address.neighborhood}, {address.city}</p>
              </div>
              <button className="vini-edit-btn">Editar</button>
            </div>
          </section>

          {/* Section: Tempo de Entrega */}
          <section className="vini-checkout-section">
             <div className="vini-section-header">
                <Clock size={20} color="var(--p-red)" />
                <h3>Horário de Entrega</h3>
             </div>
             <div className="vini-delivery-time">
                <span>Hoje, entre <strong>19:30 e 20:00</strong></span>
                <div className="vini-time-badge">30-45 min</div>
             </div>
          </section>

          {/* Section: Cupons */}
          <section className="vini-checkout-section">
             <div className="vini-section-header">
                <Ticket size={20} color="var(--p-red)" />
                <h3>Cupom de Desconto</h3>
             </div>
             <div className="vini-coupon-btn">
                <span>Adicionar cupom</span>
                <ChevronRight size={18} />
             </div>
          </section>

          {/* Section: Pagamento */}
          <section className="vini-checkout-section">
            <div className="vini-section-header">
              <CreditCard size={20} color="var(--p-red)" />
              <h3>Forma de Pagamento</h3>
            </div>
            <div className="vini-payment-options">
              {paymentOptions.map(opt => (
                <div 
                  key={opt.id} 
                  className={`vini-pm-card ${paymentMethod === opt.id ? 'active' : ''} ${opt.disabled ? 'disabled' : ''}`}
                  onClick={() => !opt.disabled && setPaymentMethod(opt.id)}
                >
                  <div className="vini-pm-icon">
                    {opt.icon}
                  </div>
                  <div className="vini-pm-info">
                    <span className="vini-pm-name">{opt.name}</span>
                    {opt.badge && (
                      <span className={`vini-pm-badge ${opt.disabled ? 'locked' : 'available'}`}>
                         {opt.disabled ? <Lock size={12} /> : null}
                         {opt.badge}
                      </span>
                    )}
                  </div>
                  {paymentMethod === opt.id && <CheckCircle2 size={20} color="#22C55E" />}
                  {opt.disabled && (
                    <div className="vini-pm-lock-msg">
                       Para usar, solicite no menu <strong>Convênios</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section: Resumo */}
          <section className="vini-checkout-section vini-resumo">
             <h3>Resumo do Pedido</h3>
             <div className="vini-resumo-row">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
             </div>
             <div className="vini-resumo-row">
                <span>Taxa de Entrega</span>
                <span className="free">GRÁTIS</span>
             </div>
             <div className="vini-resumo-row total">
                <span>Total</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
             </div>
          </section>
        </div>
      </main>

      <footer className="vini-checkout-footer">
        <div className="vini-security-badge">
           <ShieldCheck size={16} color="#22C55E" />
           <span>Transação Segura</span>
        </div>
        <button className="vini-submit-btn" onClick={handleFinish} disabled={isSubmitting || cartItems.length === 0}>
           {isSubmitting ? 'Processando...' : 'Finalizar Pedido'}
        </button>
      </footer>

      <style jsx>{`
        .vini-checkout-container {
          min-height: 100vh;
          background: #f8f8fb;
          display: flex;
          flex-direction: column;
        }
        .vini-checkout-header {
          background: #fff;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #f0f0f0;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .vini-back-btn { background: none; border: none; cursor: pointer; color: #333; }
        .vini-checkout-header-title { font-weight: 800; font-size: 18px; }
        
        .vini-checkout-content {
          flex: 1;
          max-width: 700px;
          margin: 0 auto;
          width: 100%;
          padding: 20px;
        }
        
        .vini-checkout-section {
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }
        .vini-section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .vini-section-header h3 { margin: 0; font-size: 18px; font-weight: 800; }
        
        .vini-address-card {
          display: flex;
          align-items: center;
          gap: 15px;
          background: #fcfcfc;
          padding: 15px;
          border-radius: 12px;
          border: 1px solid #f0f0f0;
        }
        .vini-address-info span { display: block; font-weight: 700; font-size: 15px; }
        .vini-address-info p { margin: 2px 0 0; font-size: 13px; color: #999; }
        .vini-edit-btn { margin-left: auto; background: none; border: none; color: var(--p-red); font-weight: 700; cursor: pointer; }
        
        .vini-delivery-time {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .vini-time-badge {
          background: #f0fdf4;
          color: #16a34a;
          padding: 5px 12px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 12px;
        }
        
        .vini-coupon-btn {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--p-red);
          font-weight: 700;
          cursor: pointer;
        }
        
        .vini-payment-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .vini-pm-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 18px;
          border-radius: 16px;
          border: 2px solid #f5f5f5;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .vini-pm-card.active { border-color: var(--p-red); background: #fef2f2; }
        .vini-pm-card.disabled { opacity: 0.6; background: #fafafa; cursor: not-allowed; }
        
        .vini-pm-icon {
          background: #fff;
          padding: 8px;
          border-radius: 10px;
          border: 1px solid #eee;
          color: #666;
        }
        .vini-pm-name { display: block; font-weight: 700; font-size: 15px; }
        .vini-pm-badge {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .vini-pm-badge.available { background: #f0fdf4; color: #16a34a; }
        .vini-pm-badge.locked { background: #f5f5f5; color: #999; }
        
        .vini-pm-lock-msg {
          position: absolute;
          right: 15px;
          bottom: 10px;
          font-size: 10px;
          color: #999;
          font-style: italic;
        }
        
        .vini-resumo h3 { margin-bottom: 20px; }
        .vini-resumo-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          color: #666;
        }
        .vini-resumo-row .free { color: #16a34a; font-weight: 700; }
        .vini-resumo-row.total {
          padding-top: 15px;
          margin-top: 10px;
          border-top: 1px dashed #eee;
          color: #000;
          font-weight: 900;
          font-size: 20px;
        }
        
        .vini-checkout-footer {
          padding: 25px;
          background: #fff;
          border-top: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
          gap: 15px;
          align-items: center;
        }
        .vini-security-badge { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #666; font-weight: 600; }
        .vini-submit-btn {
          width: 100%;
          max-width: 500px;
          background: var(--p-red);
          color: #fff;
          border: none;
          padding: 20px;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .vini-submit-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
      `}</style>
    </div>
  );
};

export default Checkout;
