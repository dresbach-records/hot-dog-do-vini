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
import api from '../services/api';

const Checkout = ({ session }) => {
  const { clientes, loading: contextLoading } = useClientes();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [address, setAddress] = useState({
    street: 'Rua Miguel Bauer',
    number: '123',
    neighborhood: 'Recreio',
    city: 'Taquara',
    complement: '',
    bairro: 'Recreio',
    city: 'Taquara',
    cep: '95600-000'
  });

  const cliente = clientes.find(c => c.codigo_vini === session?.user?.id);
  const isConvenioAtivo = cliente?.convenio_status === 'ativo';
  const convenioSaldo = Number(cliente?.convenio_saldo || 0);

  const [cartItems] = useState(() => {
    const saved = localStorage.getItem('vini-cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Nota: Cálculos visuais permanecem para UX, mas o backend IRÁ IGNORAR e recalcular.
  const subtotal = cartItems.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
  const taxaEntrega = 0;
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
      // 🚀 Chamada profissional ao novo Backend (10/10)
      const payload = {
        cliente: {
          nome: cliente?.nome || 'Cliente Vini',
          email: session?.user?.email,
          telefone: cliente?.telefone
        },
        itens: cartItems.map(item => ({
          id: item.id,
          quantidade: item.qtd || item.quantity || 1
        })),
        endereco: {
          rua: address.street,
          numero: address.number,
          bairro: address.neighborhood,
          cidade: 'Taquara',
          cep: '95600-000'
        },
        pagamento: {
          metodo: paymentMethod
        }
      };

      const result = await api.post('/orders', payload);

      if (result.success) {
        localStorage.removeItem('vini-cart');
        alert(result.message || "Pedido realizado com sucesso!");
        window.location.href = '/cliente/pedidos';
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('[Checkout Error]', err);
      alert(typeof err === 'string' ? err : "Erro ao processar pedido. Tente novamente.");
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
