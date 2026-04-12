import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Plus, Search, ShoppingCart, User, Store, 
  ChevronLeft, ArrowLeft, Send, Trash2, Edit3 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/admin/pdv.css'; 

function Garcom() {
  const [step, setStep] = useState('mesas'); // mesas -> categorias -> produtos -> carrinho
  const [selectedMesa, setSelectedMesa] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catsRes, prodsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products')
      ]);
      setCategories(catsRes.data || []);
      setProducts(prodsRes.data || []);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
       setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
       setCart([...cart, { ...product, qty: 1 }]);
    }
    // Feedback tátil ou visual rápido aqui
  };

  const finishOrder = async () => {
    if (cart.length === 0) return;
    try {
      const res = await api.post('/orders', {
        cliente_nome: `Mesa ${selectedMesa}`,
        cliente_telefone: '',
        tipo_entrega: 'retirada', // Representa consumo local neste contexto
        metodo_pagamento: 'em_aberto',
        valor_total: cart.reduce((acc, i) => acc + (i.preco * i.qty), 0),
        itens: cart.map(i => ({
          produto_id: i.id,
          quantidade: i.qty,
          preco_unitario: i.preco,
          titulo: i.titulo
        }))
      });

      if (res.success) {
        alert('Pedido enviado para a cozinha!');
        setCart([]);
        setStep('mesas');
        setSelectedMesa(null);
      }
    } catch (err) {
      alert('Erro ao enviar pedido');
    }
  };

  if (loading) return <div>Carregando App do Garçom...</div>;

  return (
    <div className="pdv-hub-container" style={{ background: '#fff' }}>
      {/* Mini Header Mobile */}
      <header style={{ height: '60px', background: '#333', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 1rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {step !== 'mesas' && <button className="btn-circle-outline" onClick={() => setStep('mesas')}><ArrowLeft color="#fff" size={20}/></button>}
          <span style={{ fontWeight: 700 }}>{selectedMesa ? `Mesa ${selectedMesa}` : 'Atendimento'}</span>
        </div>
        <div style={{ position: 'relative' }} onClick={() => setStep('carrinho')}>
          <ShoppingCart size={24}/>
          {cart.length > 0 && <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'red', color: '#fff', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{cart.length}</span>}
        </div>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        
        {step === 'mesas' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
             {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
               <button 
                 key={m} 
                 style={{ height: '80px', borderRadius: '8px', border: '1px solid #ddd', background: '#f9f9f9', fontWeight: 700, fontSize: '1.2rem' }}
                 onClick={() => { setSelectedMesa(m); setStep('categorias'); }}
               >
                 {m}
               </button>
             ))}
          </div>
        )}

        {step === 'categorias' && (
           <div style={{ display: 'grid', gap: '10px' }}>
             <div style={{ marginBottom: '10px', fontSize: '0.9rem', fontWeight: 700, color: '#666' }}>CATEGORIAS</div>
             {categories.map(cat => (
               <button 
                 key={cat.id} 
                 style={{ padding: '20px', borderRadius: '12px', background: '#333', color: '#fff', textAlign: 'left', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}
                 onClick={() => setStep(`produtos_${cat.id}`)}
               >
                 {cat.nome}
                 <Plus size={18}/>
               </button>
             ))}
           </div>
        )}

        {step.startsWith('produtos_') && (
           <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <button className="btn-circle-outline" onClick={() => setStep('categorias')}><ChevronLeft/></button>
                <div style={{ fontWeight: 700 }}>ADICIONAR ITENS</div>
              </div>
              <div style={{ display: 'grid', gap: '12px' }}>
                {products.filter(p => p.categoria_id === parseInt(step.split('_')[1])).map(prod => (
                  <div key={prod.id} style={{ display: 'flex', padding: '10px', border: '1px solid #eee', borderRadius: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
                     <div>
                       <div style={{ fontWeight: 700 }}>{prod.titulo}</div>
                       <div style={{ color: '#27ae60', fontSize: '0.9rem', fontWeight: 700 }}>R$ {prod.preco.toFixed(2)}</div>
                     </div>
                     <button className="btn-circle-outline" style={{ background: '#333', color: '#fff', border: 'none' }} onClick={() => addToCart(prod)}>
                       <Plus size={20}/>
                     </button>
                  </div>
                ))}
              </div>
           </div>
        )}

        {step === 'carrinho' && (
           <div>
              <div style={{ fontWeight: 700, marginBottom: '1.5rem' }}>RESUMO DO PEDIDO</div>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                  <div><strong>{item.qty}x</strong> {item.titulo}</div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <strong>R$ {(item.preco * item.qty).toFixed(2)}</strong>
                    <button style={{ border: 'none', background: 'none', color: 'red' }} onClick={() => setCart(cart.filter(i => i.id !== item.id))}><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700 }}>
                  <span>TOTALMESA</span>
                  <span>R$ {cart.reduce((acc, i) => acc + (i.preco * i.qty), 0).toFixed(2)}</span>
                </div>
                <button 
                  className="vini-btn-primary" 
                  style={{ width: '100%', marginTop: '20px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                  onClick={finishOrder}
                >
                  <Send size={20}/> ENVIAR PARA COZINHA
                </button>
              </div>
           </div>
        )}

      </main>

      {/* Footer Mobile Fix */}
      {step !== 'mesas' && step !== 'carrinho' && cart.length > 0 && (
        <div 
          style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '15px', background: '#333', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          onClick={() => setStep('carrinho')}
        >
           <div style={{ fontWeight: 600 }}>{cart.length} itens no carrinho</div>
           <div style={{ fontWeight: 700, background: '#27ae60', padding: '5px 15px', borderRadius: '4px' }}>Ver Resumo</div>
        </div>
      )}
    </div>
  );
}

export default Garcom;
