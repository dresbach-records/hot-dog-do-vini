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
import '../styles/cliente/sacola.css';

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
      'vini-badge': !isConvenioAtivo ? 'Não Ativo' : `Saldo: R$ ${convenioSaldo.toFixed(2)}`
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
                <div className="vini-badge-time">30-45 min</div>
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
                    {opt['vini-badge'] && (
                      <span className={`vini-badge-pm ${opt.disabled ? 'locked' : 'available'}`}>
                         {opt.disabled ? <Lock size={12} /> : null}
                         {opt['vini-badge']}
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
        <div className="vini-badge-security">
           <ShieldCheck size={16} color="#22C55E" />
           <span>Transação Segura</span>
        </div>
        <button className="vini-submit-btn" onClick={handleFinish} disabled={isSubmitting || cartItems.length === 0}>
           {isSubmitting ? 'Processando...' : 'Finalizar Pedido'}
        </button>
      </footer>


    </div>
  );
};

export default Checkout;
