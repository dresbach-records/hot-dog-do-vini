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

const PortalCliente = ({ session }) => {
  const { clientes, loading: contextLoading, adicionarCliente } = useClientes();
  const [provisioning, setProvisioning] = useState(false);
  const provisionAttempted = useRef(false);
  const [showPix, setShowPix] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('destaques');
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
    return menuItems.filter(item => item.category === selectedCategory);
  }, [selectedCategory]);

  const viniOffers = useMemo(() => {
    return menuItems.filter(item => item.oldPrice).slice(0, 4);
  }, []);

  if (contextLoading || provisioning) {
    return (
      <div className="vini-portal-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <img src="/Logo-VINI.png" alt="Vini's" style={{ width: '80px', marginBottom: '20px' }} />
        <h2 style={{ color: 'var(--p-red)' }}>Carregando...</h2>
      </div>
    );
  }

  return (
    <div className="vini-portal-layout no-sidebar">
      {/* Red Header Shell */}
      <header className="vini-portal-header">
        <img src="/Logo-VINI.png" alt="Vini Logo" className="vini-portal-logo" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }} />
        
        <div className="vini-portal-search-wrap">
          <input type="text" className="vini-portal-search-input" placeholder="O que você está buscando hoje?" />
          <button className="vini-portal-search-btn">
            <Search size={20} />
          </button>
        </div>

        <div className="vini-portal-header-actions">
          <div className="vini-portal-action-item">
            <ShoppingBag size={24} />
            <span>Sacola</span>
          </div>
          <div className="vini-portal-action-item user-trigger" onClick={() => setShowUserMenu(!showUserMenu)} style={{ position: 'relative' }}>
            <User size={24} />
            <span>Minha</span>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="vini-user-dropdown" ref={menuRef}>
                <div className="vini-user-dropdown-header">
                   <div style={{ fontWeight: '800', fontSize: '18px' }}>Olá, {clienteLogado?.nome?.split(' ')[0] || 'Cliente'}</div>
                   <div style={{ fontSize: '12px', color: '#999' }}>Acesse seus dados e pedidos</div>
                </div>
                
                <div className="vini-user-dropdown-list">
                  <div className="vini-dropdown-item"><ClipboardList size={18} /> Pedidos</div>
                  <div className="vini-dropdown-item highlight-red">
                    <div style={{ position: 'relative' }}>
                      <Ticket size={18} />
                      <span className="vini-badge-mini">34</span>
                    </div>
                    Meus Cupons
                  </div>
                  <div className="vini-dropdown-item"><Heart size={18} /> Favoritos</div>
                  <div className="vini-dropdown-item"><CreditCard size={18} /> Pagamento</div>
                  <div className="vini-dropdown-item"><Star size={18} /> Fidelidade</div>
                  <div className="vini-dropdown-divider"></div>
                  <div className="vini-dropdown-item"><LifeBuoy size={18} /> Ajuda</div>
                  <div className="vini-dropdown-item"><Settings size={18} /> Meus dados</div>
                  <div className="vini-dropdown-item"><Shield size={18} /> Segurança</div>
                  <div className="vini-dropdown-divider"></div>
                  <div className="vini-dropdown-item" onClick={() => supabase.auth.signOut()} style={{ color: '#EA1D2C' }}>
                    <LogOut size={18} /> Sair
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Secondary Navigation */}
      <nav className="vini-portal-subnav">
        <div className="vini-portal-subnav-left" style={{ gap: '20px' }}>
           {/* Conditional Saldo (Only if integration is active) */}
           {stats.isConvenioAtivo && (
             <div className="vini-saldo-bar-active">
                <Wallet size={18} color="var(--p-red)" />
                <div className="vini-saldo-labels">
                  <span className="vini-saldo-label-main">LIMITE CONVÊNIO: <span className="vini-saldo-val">R$ {stats.limite.toFixed(2)}</span></span>
                  <span className="vini-saldo-label-sub">Disponível: <span className="vini-saldo-val-highlight">R$ {stats.disponivel.toFixed(2)}</span></span>
                </div>
             </div>
           )}
        </div>
        <div className="vini-portal-subnav-right">
           <div className="vini-portal-subnav-item" onClick={() => (window.location.href = '/#cardapio')}><Store size={16} /> Convênios</div>
           <div className="vini-portal-subnav-item" onClick={() => setSelectedCategory('combos')}><Package size={16} /> Combos</div>
           <div className="vini-portal-subnav-item" onClick={() => setSelectedCategory('hotdog')}><Utensils size={16} /> Produtos</div>
           <div className="vini-portal-subnav-item" onClick={() => setSelectedCategory('destaques')}><Flame size={16} /> Ofertas</div>
           <div className="vini-portal-subnav-item"><Heart size={16} /> Favoritos</div>
        </div>
      </nav>

      {/* Content Shell (No Sidebar) */}
      <div className="vini-portal-shell-full">
        <main className="vini-portal-content-full">
          
          {/* OFERTAS NO TOPO (AS REQUESTED) */}
          <h2 className="vini-portal-section-title">Ofertas para Você 🔥</h2>
          <div className="vini-portal-offers-grid" style={{ marginBottom: '50px' }}>
            {viniOffers.map(offer => {
              try {
                const priceNum = parseFloat(offer.price.replace('R$ ', '').replace(',', '.'));
                const oldPriceNum = parseFloat(offer.oldPrice.replace('R$ ', '').replace(',', '.'));
                const discount = Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100);

                return (
                  <a key={offer.title} href={offer.ifoodUrl} target="_blank" className="vini-portal-offer-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="vini-portal-offer-badge">{discount}% OFF</div>
                    <img src={offer.image} alt={offer.title} className="vini-portal-offer-img" />
                    <div className="vini-portal-offer-body">
                      <h4 className="vini-portal-offer-title">{offer.title}</h4>
                      <p className="vini-portal-offer-subtitle" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{offer.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#999', textDecoration: 'line-through' }}>{offer.oldPrice}</span>
                        <div className="vini-portal-offer-price">{offer.price}</div>
                      </div>
                      <div className="vini-portal-promo-badge">PROMOÇÃO</div>
                    </div>
                  </a>
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
               {viniCategories.find(c => c.id === selectedCategory)?.name}
               <span style={{ fontSize: '14px', fontWeight: '400', color: '#999' }}>({filteredProducts.length} itens)</span>
            </h2>
            <div className="vini-portal-offers-grid">
               {filteredProducts.map(product => (
                  <div key={product.title} className="vini-portal-offer-card">
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
        </main>
      </div>

      {/* Footer Shell */}
      <footer className="vini-portal-footer">
        <div className="vini-portal-footer-links">
          <span>Termos de Uso</span>
          <span>Política de Reembolso</span>
          <span>Contato</span>
        </div>
        
        <div className="vini-portal-footer-actions">
          <div className="vini-portal-footer-action-item">
             <User size={20} /> Sobre Nós
          </div>
          <div className="vini-portal-footer-action-item">
             <Headphones size={20} /> Central de Ajuda
          </div>
          <div className="vini-portal-footer-action-item">
             <Phone size={20} /> Fale Conosco
          </div>
        </div>

        <div className="vini-portal-copyright">
          © Copyright 2026 - VINI'S - Todos os direitos reservados VINI'S CNPJ 63.073.948/0001-97 / RUA MIGUEL BAUER TAQUARA/RS - CEP 95.600-320
        </div>
      </footer>
    </div>
  );
};

export default PortalCliente;
