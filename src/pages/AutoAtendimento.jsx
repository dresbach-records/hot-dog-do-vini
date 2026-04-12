import React, { useState } from 'react';
import { 
  ShoppingBag, Utensils, Zap, Clock, 
  ChevronRight, ChevronLeft, Plus, Minus,
  CheckCircle, X, Search
} from 'lucide-react';
import '../styles/admin/dashboard.css';

function AutoAtendimento() {
  const [step, setStep] = useState('welcome'); // welcome, categories, items, cart, success
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);

  // Mock data for totem (will be replaced by real context/api)
  const categories = [
    { id: 1, nome: 'Hot Dogs', icon: <Utensils /> },
    { id: 2, nome: 'Bebidas', icon: <ShoppingBag /> },
    { id: 3, nome: 'Sobremesas', icon: <Zap /> },
  ];

  const items = [
    { id: 101, categoryId: 1, nome: 'Dog Simples', preco: 18.50, descricao: 'Pão, salsicha, tomate e molho.' },
    { id: 102, categoryId: 1, nome: 'Dog Duplo', preco: 23.90, descricao: '2 Salsichas, queijo e molho especial.' },
    { id: 201, categoryId: 2, nome: 'Coca-Cola 350ml', preco: 7.00, descricao: 'Lata gelada.' },
  ];

  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const item = cart.find(i => i.id === itemId);
    if (item.qty > 1) {
      setCart(cart.map(i => i.id === itemId ? { ...i, qty: i.qty - 1 } : i));
    } else {
      setCart(cart.filter(i => i.id !== itemId));
    }
  };

  const total = cart.reduce((acc, item) => acc + (item.preco * item.qty), 0);

  return (
    <div className="totem-container" style={{ height: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER */}
      <header style={{ padding: '2rem', background: '#fff', borderBottom: '2px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '50px', height: '50px', background: 'var(--c-red)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Utensils color="#fff" size={30} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '900' }}>Vini's Delivery</h1>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>AUTO-ATENDIMENTO</span>
          </div>
        </div>
        
        {cart.length > 0 && step !== 'cart' && step !== 'success' && (
           <button 
             onClick={() => setStep('cart')}
             style={{ background: 'var(--c-red)', color: '#fff', padding: '1rem 2rem', borderRadius: '15px', border: 'none', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', gap: '10px', alignItems: 'center', boxShadow: '0 10px 20px rgba(239, 68, 68, 0.3)' }}
           >
             <ShoppingBag /> {cart.length} ITENS - R$ {total.toFixed(2)}
           </button>
        )}
      </header>

      {/* CONTENT */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        
        {step === 'welcome' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
             <img src="/logo.png" alt="Vini's" style={{ width: '250px', marginBottom: '2rem' }} />
             <h2 style={{ fontSize: '3rem', fontWeight: '900', color: '#0f172a', marginBottom: '1rem' }}>Seja bem-vindo!</h2>
             <p style={{ fontSize: '1.5rem', color: '#64748b', marginBottom: '3rem' }}>Toque abaixo para iniciar seu pedido.</p>
             <button 
               onClick={() => setStep('categories')}
               style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', background: '#0f172a', color: '#fff', borderRadius: '25px', border: 'none', fontSize: '2rem', fontWeight: '900', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)', cursor: 'pointer' }}
             >
               INICIAR PEDIDO
             </button>
          </div>
        )}

        {step === 'categories' && (
          <div className="animate-fade-in">
             <h3 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Escolha uma categoria</h3>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat); setStep('items'); }}
                    style={{ padding: '3rem 2rem', background: '#fff', borderRadius: '25px', border: '2px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', cursor: 'pointer', transition: 'transform 0.2s' }}
                  >
                    <div style={{ padding: '1.5rem', background: 'var(--bg-active)', borderRadius: '20px', color: 'var(--c-red)' }}>
                      {React.cloneElement(cat.icon, { size: 48 })}
                    </div>
                    <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{cat.nome}</span>
                  </button>
                ))}
             </div>
          </div>
        )}

        {step === 'items' && selectedCategory && (
           <div className="animate-fade-in">
              <button 
                onClick={() => setStep('categories')}
                style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2rem', cursor: 'pointer' }}
              >
                <ChevronLeft /> Voltar para Categorias
              </button>
              
              <h3 style={{ fontSize: '2.2rem', marginBottom: '2.5rem' }}>{selectedCategory.nome}</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                 {items.filter(i => i.categoryId === selectedCategory.id).map(item => (
                   <div key={item.id} style={{ background: '#fff', borderRadius: '25px', padding: '1.5rem', display: 'flex', gap: '20px', border: '2px solid var(--border-color)' }}>
                      <div style={{ width: '120px', height: '120px', background: 'var(--bg-active)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <ShoppingBag size={40} opacity={0.2} />
                      </div>
                      <div style={{ flex: 1 }}>
                         <h4 style={{ margin: '0 0 5px 0', fontSize: '1.4rem' }}>{item.nome}</h4>
                         <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem' }}>{item.descricao}</p>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--c-red)' }}>R$ {item.preco.toFixed(2)}</span>
                            <button 
                              onClick={() => addToCart(item)}
                              style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '15px', fontWeight: 'bold' }}
                            >
                              ADICIONAR +
                            </button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {step === 'cart' && (
          <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
             <h3 style={{ fontSize: '2.2rem', marginBottom: '2rem' }}>Seu Carrinho</h3>
             <div className="vini-glass-panel" style={{ padding: '2rem', background: '#fff' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.3rem' }}>{item.nome}</h4>
                      <span style={{ color: 'var(--c-red)', fontWeight: 'bold' }}>R$ {(item.preco * item.qty).toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <button onClick={() => removeFromCart(item.id)} style={{ width: '45px', height: '45px', borderRadius: '50%', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus /></button>
                      <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{item.qty}</span>
                      <button onClick={() => addToCart(item)} style={{ width: '45px', height: '45px', borderRadius: '50%', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus /></button>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '4px double var(--border-color)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '2.2rem', fontWeight: '900' }}>
                      <span>TOTAL</span>
                      <span style={{ color: 'var(--c-red)' }}>R$ {total.toFixed(2)}</span>
                   </div>
                </div>
             </div>

             <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1.5rem' }}>
                <button onClick={() => setStep('categories')} className="vini-btn-outline" style={{ flex: 1, padding: '1.5rem', fontSize: '1.3rem', borderRadius: '20px' }}>CONTINUAR COMPRANDO</button>
                <button onClick={() => setStep('success')} className="vini-btn-primary" style={{ flex: 1, padding: '1.5rem', fontSize: '1.5rem', borderRadius: '20px', background: 'var(--c-green)', borderColor: 'var(--c-green)' }}>FINALIZAR PEDIDO</button>
             </div>
          </div>
        )}

        {step === 'success' && (
          <div className="animate-scale-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
             <div style={{ width: '120px', height: '120px', background: 'var(--c-green)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', boxShadow: '0 20px 40px rgba(34, 197, 94, 0.3)' }}>
                <CheckCircle size={70} color="#fff" />
             </div>
             <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '1rem' }}>Pedido Realizado!</h2>
             <p style={{ fontSize: '1.5rem', color: '#64748b', marginBottom: '3rem' }}>Retire sua senha no balcão: <strong style={{ color: '#000', fontSize: '2.5rem' }}>#42</strong></p>
             <button 
               onClick={() => { setCart([]); setStep('welcome'); }}
               style={{ padding: '1.5rem 4rem', background: '#0f172a', color: '#fff', borderRadius: '20px', border: 'none', fontSize: '1.3rem', fontWeight: 'bold' }}
             >
               NOVO PEDIDO
             </button>
          </div>
        )}
      </main>
      
      {/* FOOTER */}
      <footer style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--bg-active)' }}>
        Toque na tela para navegar • Vini's Cloud Totem v1.0
      </footer>
    </div>
  );
}

export default AutoAtendimento;
