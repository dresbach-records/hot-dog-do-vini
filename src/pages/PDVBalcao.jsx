import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ShoppingBag, 
  Trash2, 
  User, 
  Zap, 
  CreditCard, 
  DollarSign, 
  Plus, 
  Minus,
  CheckCircle2,
  XCircle,
  Smartphone
} from 'lucide-react';
import { useClientes } from '../context/ClientesContext';

function PDVBalcao() {
  const { clientes } = useClientes();
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);
  const [finalizando, setFinalizando] = useState(false);
  const [passo, setPasso] = useState('venda'); // venda, pagamento, sucesso

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    setLoading(true);
    try {
      const [resProds, resCats] = await Promise.all([
        api.get('/products/active'),
        api.get('/products/categories')
      ]);

      const prods = resProds.data || [];
      const cats = resCats.data || [];

      setProdutos(prods);
      setCategorias(cats);
      
      if (cats.length > 0) {
        setActiveCat(cats[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar PDV:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const adicCarrinho = (p) => {
    setCarrinho(prev => {
      const exists = prev.find(item => item.id === p.id);
      if (exists) {
        return prev.map(item => item.id === p.id ? { ...item, qtd: item.qtd + 1 } : item);
      }
      return [...prev, { ...p, qtd: 1 }];
    });
  };

  const removeCarrinho = (id) => {
    setCarrinho(prev => prev.filter(item => item.id !== id));
  };

  const total = carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);

  const finalizarVenda = async (metodo) => {
    setFinalizando(true);
    try {
      // Criar pedido no backend VPS
      const orderData = {
        items: carrinho.map(item => ({
          produto_id: item.id,
          quantidade: item.qtd,
          preco_unitario: item.preco
        })),
        total,
        forma_pagamento: metodo,
        tipo: 'balcao'
      };

      const response = await api.post('/orders', orderData);

      if (response.success) {
        setPasso('sucesso');
        setCarrinho([]);
        // Auto-reset para nova venda após 3 segundos
        setTimeout(() => setPasso('venda'), 3000);
      } else {
        alert('Erro ao finalizar venda: ' + response.error);
      }
    } catch (err) {
      alert('Erro de conexão ao finalizar venda');
    } finally {
      setFinalizando(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-red-500">Ligando os motores do PDV...</div>;

  return (
    <div className="pdv-container" style={{ display: 'grid', gridTemplateColumns: '1fr 450px', height: 'calc(100vh - 80px)', background: '#0b0e11', color: '#fff', overflow: 'hidden' }}>
      
      {/* LADO ESQUERDO: SELEÇÃO DE PRODUTOS */}
      <div className="pdv-main" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
        
        {/* CATEGORIAS (PILLS) */}
        <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '10px' }}>
          {categorias.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCat(cat.id)}
              style={{ 
                padding: '12px 25px', borderRadius: '30px', border: 'none', cursor: 'pointer',
                background: activeCat === cat.id ? 'var(--c-red)' : 'rgba(255,255,255,0.05)',
                color: '#fff', fontWeight: '800', whiteSpace: 'nowrap', transition: '0.3s'
              }}
            >
              {cat.nome}
            </button>
          ))}
        </div>

        {/* GRID DE PRODUTOS TIPO "TILE" */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
          {produtos.filter(p => p.categoria_id === activeCat).map(p => (
            <div 
              key={p.id} 
              className="pdv-product-card" 
              onClick={() => adicCarrinho(p)}
              style={{ 
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', 
                padding: '1rem', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', transition: '0.2s'
              }}
            >
              <div style={{ width: '100%', height: '100px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={p.imagem_url || '/placeholder-dog.png'} alt={p.titulo} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
              </div>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>{p.titulo}</h4>
              <strong style={{ color: 'var(--c-green)', fontSize: '1.1rem' }}>R$ {p.preco.toFixed(2)}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* LADO DIREITO: CHECKOUT BALCÃO */}
      <div className="pdv-checkout" style={{ background: '#161a1f', borderLeft: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="var(--c-red)" /> Pedido Balcão
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>VINI'S #{Math.floor(Math.random() * 9000) + 1000}</span>
        </div>

        {passo === 'venda' && (
          <>
            <div className="pdv-items-list" style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {carrinho.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '4rem', color: 'rgba(255,255,255,0.2)' }}>
                  <ShoppingBag size={48} style={{ marginBottom: '1rem' }} />
                  <p>Carrinho vazio. Selecione itens ao lado.</p>
                </div>
              ) : (
                carrinho.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{item.qtd}x {item.titulo}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--c-green)' }}>R$ {(item.preco * item.qtd).toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button className="pdv-small-btn" onClick={() => removeCarrinho(item.id)}><Trash2 size={14} color="#ef4444" /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pdv-footer" style={{ padding: '1.5rem', background: '#1c2229', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '400' }}>SUBTOTAL</span>
                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--c-green)' }}>R$ {total.toFixed(2)}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button 
                  className="vini-btn-primary" 
                  disabled={carrinho.length === 0} 
                  style={{ gridColumn: '1 / -1', padding: '18px', fontSize: '1.2rem' }}
                  onClick={() => setPasso('pagamento')}
                >
                  Continuar para Pagamento
                </button>
                <button className="vini-btn-outline" onClick={() => setCarrinho([])} style={{ height: '50px' }}>Limpar</button>
                <button className="vini-btn-outline" style={{ height: '50px' }}>Cliente</button>
              </div>
            </div>
          </>
        )}

        {passo === 'pagamento' && (
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'slideRight 0.3s forwards' }}>
            <button onClick={() => setPasso('venda')} style={{ background: 'none', border: 'none', color: 'var(--c-red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              Voltar aos itens
            </button>
            <h2 style={{ margin: 0 }}>Total: R$ {total.toFixed(2)}</h2>
            <p style={{ color: 'var(--text-muted)' }}>Escolha a forma de pagamento rápida:</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              <button className="pdv-pay-btn" onClick={() => finalizarVenda('dinheiro')} style={{ background: '#22c55e' }}>
                <DollarSign size={24} /> DINHEIRO (BALCÃO)
              </button>
              <button className="pdv-pay-btn" onClick={() => finalizarVenda('pix')} style={{ background: '#3b82f6' }}>
                <Zap size={24} /> PIX INSTANTÂNEO
              </button>
              <button className="pdv-pay-btn" onClick={() => finalizarVenda('cartao')} style={{ background: '#f59e0b' }}>
                <CreditCard size={24} /> CARTÃO / DÉBITO
              </button>
            </div>
          </div>
        )}

        {passo === 'sucesso' && (
          <div style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, gap: '1rem' }}>
            <CheckCircle2 size={72} color="#22c55e" style={{ margin: '0 auto' }} />
            <h2 style={{ fontSize: '2rem' }}>VENDA REALIZADA!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Cupom enviado para impressão térmica.</p>
            <div style={{ border: '2px dashed rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
              <strong>Venda #992</strong><br />
              Total: R$ {total.toFixed(2)}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .pdv-product-card:hover { 
          background: rgba(255,255,255,0.06) !important;
          border-color: var(--c-red) !important;
          transform: translateY(-3px);
        }
        .pdv-small-btn {
          width: 38px; height: 38px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.2); cursor: pointer; display: flex; alignItems: center; justifyContent: center;
        }
        .pdv-pay-btn {
          padding: 25px; border-radius: 16px; border: none; color: #fff; font-weight: 900;
          font-size: 1.2rem; cursor: pointer; display: flex; alignItems: center; justifyContent: center; gap: 15px;
          transition: 0.2s;
        }
        .pdv-pay-btn:hover { filter: brightness(1.2); transform: scale(1.02); }
      `}</style>
    </div>
  );
}

export default PDVBalcao;

