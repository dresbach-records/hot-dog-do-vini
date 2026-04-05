import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ShoppingBag, 
  User, 
  Search, 
  Home, 
  ClipboardList, 
  Heart, 
  Headphones, 
  Store,
  ChevronRight,
  LogOut,
  Star,
  Wallet,
  AlertTriangle,
  Copy,
  Phone,
  Gift,
  Flame,
  Utensils,
  Beef,
  Package,
  Soup,
  Beer,
  Ticket,
  LifeBuoy,
  Shield,
  Settings,
  CreditCard,
  ArrowRight
} from 'lucide-react';
import { useClientes } from '../context/ClientesContext';
import { supabase } from '../lib/supabaseClient';
import { menuItems, categories as siteCategories } from '../lib/siteData';
import ProductModal from '../components/Site/ProductModal';
import CartDrawer from '../components/Site/CartDrawer';
import '../styles/cliente/layout.css';
import '../styles/cliente/dashboard.css';
import '../styles/cliente/convenios.css';

const PortalCliente = ({ session }) => {
  const { clientes, loading: contextLoading, adicionarCliente } = useClientes();
  const [provisioning, setProvisioning] = useState(false);
  const provisionAttempted = useRef(false);
  const [showPix, setShowPix] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('destaques');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const menuRef = useRef(null);

  const clienteLogado = useMemo(() => {
    if (!clientes || !session?.user) return null;
    return clientes.find(c => c.codigo_vini === session.user.id);
  }, [clientes, session]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const autoCreateProfile = async () => {
      if (!contextLoading && !clienteLogado && session?.user && !provisionAttempted.current) {
        provisionAttempted.current = true;
        setProvisioning(true);
        try {
          await adicionarCliente({
            nome: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            codigo_vini: session.user.id,
            email: session.user.email,
            total_cliente: 0,
            saldo_devedor: 0
          });
        } catch (err) {
          console.error("Erro no auto-provisionamento:", err);
        } finally {
          setProvisioning(false);
        }
      }
    };
    autoCreateProfile();
  }, [clienteLogado, contextLoading, session, adicionarCliente]);

  const stats = useMemo(() => {
    if (!clienteLogado) return { total: 0, saldo: 0, limite: 150 };
    return { 
      total: Number(clienteLogado.total_cliente || 0), 
      saldo: Number(clienteLogado.saldo_devedor || 0),
      limite: Number(clienteLogado.convenio_limite || 150),
      disponivel: Number(clienteLogado.convenio_saldo || 150),
      isConvenioAtivo: clienteLogado.convenio_status === 'ativo'
    };
  }, [clienteLogado]);

  const viniCategories = [
    { id: 'destaques', name: 'Mais Pedidos', icon: <Flame size={24} color="#EA1D2C" />, bgColor: '#FEF2F2' },
    { id: 'hotdog', name: 'Hot Dogs', icon: <Utensils size={24} color="#EA1D2C" />, bgColor: '#FFF7ED' },
    { id: 'burgers', name: 'Burgers', icon: <Beef size={24} color="#EA1D2C" />, bgColor: '#F0FDF4' },
    { id: 'combos', name: 'Combos', icon: <Package size={24} color="#EA1D2C" />, bgColor: '#F5F3FF' },
    { id: 'batatas', name: 'Batatas', icon: <Soup size={24} color="#EA1D2C" />, bgColor: '#FFFBEB' },
    { id: 'bebidas', name: 'Bebidas', icon: <Beer size={24} color="#EA1D2C" />, bgColor: '#EFF6FF' },
  ];

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'todos') return menuItems;
    return menuItems.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  const viniOffers = useMemo(() => {
    return menuItems.filter(item => item.oldPrice).slice(0, 4);
  }, []);

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      // Check if item with same observations already exists
      const existingIdx = prev.findIndex(item => item.title === product.title && item.observations === product.observations);
      if (existingIdx > -1) {
        const newItems = [...prev];
        const item = newItems[existingIdx];
        const newQty = item.quantity + product.quantity;
        newItems[existingIdx] = {
           ...item,
           quantity: newQty,
           totalPrice: parseFloat(item.price.replace('R$ ', '').replace(',', '.')) * newQty
        };
        return newItems;
      }
      return [...prev, product];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (idx, delta) => {
    setCartItems(prev => {
      const newItems = [...prev];
      const item = newItems[idx];
      const newQty = Math.max(1, item.quantity + delta);
      newItems[idx] = {
        ...item,
        quantity: newQty,
        totalPrice: parseFloat(item.price.replace('R$ ', '').replace(',', '.')) * newQty
      };
      return newItems;
    });
  };

  const removeFromCart = (idx) => {
    setCartItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCheckout = () => {
    localStorage.setItem('vini-cart', JSON.stringify(cartItems));
    window.location.href = '/checkout';
    setIsCartOpen(false);
  };

  if (contextLoading || provisioning) {
    return (
      <div className="vini-portal-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <img src="/Logo-VINI.png" alt="Vini's" style={{ width: '80px', marginBottom: '20px' }} />
        <h2 style={{ color: 'var(--p-red)' }}>Carregando...</h2>
      </div>
    );
  }

  return (
    <div className="vini-portal-layout no-sidebar portal-container">
      {/* Red Header Shell — PREMIUM */}
      <header className="vini-portal-header">
        <div className="vini-portal-header-left">
          <img 
            src="/Logo-VINI.png" 
            alt="Vini Logo" 
            className="vini-portal-logo" 
            onClick={() => window.location.href = '/'} 
            style={{ cursor: 'pointer' }} 
          />
        </div>
        
        <div className="vini-portal-search-wrap">
          <input 
            type="text" 
            className="vini-portal-search-input" 
            placeholder="Qual é a sua fome de hoje? 🌭" 
          />
          <button className="vini-portal-search-btn">
            <Search size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="vini-portal-header-actions">
          <div className="vini-portal-action-item" onClick={() => setIsCartOpen(true)}>
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={28} strokeWidth={2.5} />
              {cartItems.length > 0 && <span className="vini-badge-cart">{cartItems.length}</span>}
            </div>
            <span>Sacola</span>
          </div>

          <div className="vini-portal-action-item user-trigger" onClick={() => setShowUserMenu(!showUserMenu)} style={{ position: 'relative' }}>
            <User size={28} strokeWidth={2.5} />
            <span>Minha</span>

            {/* Dropdown Menu Premium */}
            {showUserMenu && (
              <div className="vini-user-dropdown" ref={menuRef}>
                <div className="vini-user-dropdown-header">
                   <div style={{ fontWeight: '900', fontSize: '18px', color: '#111' }}>
                     Olá, {clienteLogado?.nome?.split(' ')[0] || 'Vini Fan'} 👋
                   </div>
                   <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                     Explore seu portal exclusivo
                   </div>
                </div>
                
                <div className="vini-user-dropdown-list">
                  <div className="vini-dropdown-item" onClick={() => window.location.href = '/cliente/pedidos'}>
                    <ClipboardList size={20} color="#64748b" /> Meus Pedidos
                  </div>
                  <div className="vini-dropdown-item" onClick={() => window.location.href = '/cliente/cupons'}>
                    <Ticket size={20} color="#EA1D2C" /> Meus Cupons
                  </div>
                  <div className="vini-dropdown-item">
                    <Heart size={20} color="#64748b" /> Favoritos
                  </div>
                  <div className="vini-dropdown-item" onClick={() => window.location.href = '/cliente/fidelidade'}>
                    <Star size={20} color="#F59E0B" /> Fidelidade Vini
                  </div>
                  <div className="vini-dropdown-divider"></div>
                  <div className="vini-dropdown-item" onClick={() => window.location.href = '/cliente/perfil'}>
                    <Settings size={20} color="#64748b" /> Meus Dados
                  </div>
                  <div className="vini-dropdown-item" onClick={() => supabase.auth.signOut()} style={{ color: '#EA1D2C' }}>
                    <LogOut size={20} /> Encerrar Sessão
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Secondary Navigation — PREMIUM STICKY */}
      <nav className="vini-portal-subnav">
        <div className="vini-portal-subnav-left">
           {stats.isConvenioAtivo ? (
             <div className="vini-saldo-bar-active">
                <Wallet size={20} color="#EA1D2C" strokeWidth={2.5} />
                <div className="vini-saldo-labels">
                  <span className="vini-saldo-label-main">SALDO CONVÊNIO</span>
                  <span className="vini-saldo-label-sub">
                    Disponível: <span className="vini-saldo-val-highlight">R$ {stats.disponivel.toFixed(2).replace('.', ',')}</span>
                  </span>
                </div>
             </div>
           ) : (
             <div className="vini-saldo-bar-active" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                <Gift size={20} color="#64748b" />
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>CADASTRE SEU CONVÊNIO</span>
             </div>
           )}
        </div>
        
        <div className="vini-portal-subnav-right">
           <div className={`vini-portal-subnav-item ${selectedCategory === 'combos' ? 'active' : ''}`} onClick={() => setSelectedCategory('combos')}>
             <Package size={18} /> <span>Combos</span>
           </div>
           <div className={`vini-portal-subnav-item ${selectedCategory === 'hotdog' ? 'active' : ''}`} onClick={() => setSelectedCategory('hotdog')}>
             <Utensils size={18} /> <span>Hot Dogs</span>
           </div>
           <div className="vini-portal-subnav-item" onClick={() => window.location.href = '/convenios'}>
             <Store size={18} /> <span>Empresas</span>
           </div>
        </div>
      </nav>

      {/* Content Shell (No Sidebar) */}
      <div className="vini-portal-shell-full">
        <main className="vini-portal-content-full">
          
          {contextLoading ? (
            <div className="vini-skeleton-container">
               <div className="vini-skeleton" style={{ height: '40px', width: '300px', marginBottom: '20px' }}></div>
               <div className="vini-portal-offers-grid">
                  {[1,2,3,4].map(i => <div key={i} className="vini-skeleton" style={{ height: '300px' }}></div>)}
               </div>
            </div>
          ) : (
            <>
              {/* OFERTAS NO TOPO — PREMIUM CARDS */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                  <h2 className="vini-portal-section-title">Ofertas Imperdíveis 🔥</h2>
                  <p className="vini-portal-section-subtitle">Os favoritos do Vini com preços especiais</p>
                </div>
                <button 
                  className="vini-portal-subnav-item" 
                  onClick={() => setSelectedCategory('todos')}
                  style={{ background: 'none', border: 'none', color: '#EA1D2C', marginBottom: '20px' }}
                >
                  Ver todos <ArrowRight size={16} />
                </button>
              </div>
          <div className="vini-portal-offers-grid" style={{ marginBottom: '50px' }}>
            {viniOffers.map(offer => {
              try {
                const priceNum = parseFloat(offer.price.replace('R$ ', '').replace(',', '.'));
                const oldPriceNum = parseFloat(offer.oldPrice.replace('R$ ', '').replace(',', '.'));
                const discount = Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100);

                return (
                    <div 
                      key={offer.title} 
                      className="vini-portal-offer-card" 
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedProduct(offer)}
                    >
                      <div className="vini-badge-offer">{discount}% OFF</div>
                      <img src={offer.image} alt={offer.title} className="vini-portal-offer-img" />
                      <div className="vini-portal-offer-body">
                        <h4 className="vini-portal-offer-title">{offer.title}</h4>
                        <p className="vini-portal-offer-subtitle" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{offer.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through' }}>{offer.oldPrice}</span>
                          <div className="vini-portal-offer-price">{offer.price}</div>
                        </div>
                        <div className="vini-badge-promo">PROMOÇÃO</div>
                      </div>
                    </div>
                );
              } catch(e) { return null; }
            })}
          </div>

          <h2 className="vini-portal-section-title">Nossas Categorias</h2>
          <p className="vini-portal-section-subtitle">Escolha o que deseja saborear hoje!</p>

          <div className="vini-portal-category-grid" style={{ marginBottom: '40px' }}>
            {viniCategories.map(cat => (
              <div 
                key={cat.id} 
                className={`vini-portal-category-card ${selectedCategory === cat.id ? 'active' : ''}`} 
                onClick={() => setSelectedCategory(cat.id)}
              >
                <div className="vini-portal-category-card-img-wrap" style={{ backgroundColor: cat.bgColor }}>
                  {cat.icon}
                </div>
                <span className="vini-portal-category-name">{cat.name}</span>
              </div>
            ))}
          </div>

          {/* Dynamic Products Grid (Main Filtered Menu) */}
          <div style={{ marginBottom: '50px' }}>
            <h2 className="vini-portal-section-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
               {selectedCategory === 'todos' ? 'Todos os Produtos' : viniCategories.find(c => c.id === selectedCategory)?.name}
               <span style={{ fontSize: '14px', fontWeight: '400', color: '#999' }}>({filteredProducts.length} itens)</span>
            </h2>
            <div className="vini-portal-offers-grid">
                {filteredProducts.map(product => (
                  <div key={product.title} className="vini-portal-offer-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedProduct(product)}>
                     <img src={product.image} alt={product.title} className="vini-portal-offer-img" />
                     <div className="vini-portal-offer-body">
                        <h4 className="vini-portal-offer-title">{product.title}</h4>
                        <p className="vini-portal-offer-subtitle" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                           <span className="vini-portal-offer-price">{product.price}</span>
                           <button style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                              <ArrowRight size={16} color="var(--p-red)" />
                           </button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
          </div>

          {/* Finance Warning if balance > 0 */}
          {stats.saldo > 0 && (
            <div style={{ marginTop: '40px', background: '#FEF2F2', padding: '25px', borderRadius: '16px', display: 'flex', gap: '20px' }}>
               <AlertTriangle color="var(--p-red)" size={32} />
               <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Pendente de Pagamento</h3>
                  <p style={{ margin: '5px 0 15px', color: '#666' }}>Seu saldo devedor é de R$ {stats.saldo.toFixed(2)}. Pague via PIX para continuar comprando.</p>
                  <button 
                    onClick={() => setShowPix(!showPix)}
                    style={{ background: 'var(--p-red)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    Exibir QR Code PIX
                  </button>
                  {showPix && (
                    <div style={{ marginTop: '15px', background: '#fff', padding: '15px', borderRadius: '8px', border: '2px dashed var(--p-red)' }}>
                      <code style={{ fontSize: '11px', wordBreak: 'break-all' }}>00020126360014br.gov.bcb.pix0114051048450001855204000053039865802BR5925MARCOS VINICIUS DRESBACH D6009TAQUARA62070503***6304E2D2</code>
                    </div>
                  )}
               </div>
            </div>
          )}
            </>
          )}
        </main>
      </div>

      {/* Footer Shell — PREMIUM */}
      <footer className="vini-portal-footer">
        <div className="vini-portal-footer-links">
          <span>Quem Somos</span>
          <span>Privacidade</span>
          <span>Termos</span>
          <span>Franquias</span>
        </div>
        
        <div className="vini-portal-footer-actions">
          <div className="vini-portal-footer-action-item">
             <User size={22} color="#EA1D2C" /> Sou Parceiro
          </div>
          <div className="vini-portal-footer-action-item">
             <Headphones size={22} color="#EA1D2C" /> Ajuda
          </div>
          <div className="vini-portal-footer-action-item">
             <Phone size={22} color="#EA1D2C" /> (51) 99765-4321
          </div>
        </div>

        <div className="vini-portal-copyright">
          © 2026 VINI'S INDUSTRIAL — O verdadeiro hot dog taquarense. 
          <br/>
          HOT DOG DO VINI.LTDA | CNPJ 63.073.948/0001-97
        </div>
      </footer>

      {/* MODALS */}
      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={handleAddToCart}
      />

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={updateCartQty}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default PortalCliente;
