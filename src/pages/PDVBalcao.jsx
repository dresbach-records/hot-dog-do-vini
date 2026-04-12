import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ShoppingBag, Trash2, User, Zap, CreditCard, DollarSign, 
  Plus, Minus, CheckCircle2, XCircle, Search, 
  ArrowLeft, Printer, MoreVertical, Layers
} from 'lucide-react';
import { useClientes } from '../context/ClientesContext';
import { useCaixa } from '../context/CaixaContext';
import AbrirCaixaModal from '../components/Caixa/AbrirCaixaModal';
import ProductModal from '../components/Site/ProductModal';

function PDVBalcao() {
  const { sessaoAtiva, loading: caixaLoading } = useCaixa();
  const { clientes } = useClientes();
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);
  const [finalizando, setFinalizando] = useState(false);
  const [passo, setPasso] = useState('venda'); // venda, pagamento, sucesso
  
  // States para Split Payment
  const [metodosPagamento, setMetodosPagamento] = useState([]); // [{metodo, valor}]
  const [valorRestante, setValorRestante] = useState(0);
  
  // Customizações
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    setLoading(true);
    try {
      const [resProds, resCats] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      setProdutos(resProds.data || []);
      setCategorias(resCats.data || []);
      if (resCats.data?.length > 0) setActiveCat(resCats.data[0].id);
    } catch (err) {
      console.error('Erro ao carregar PDV:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const adicCarrinho = (p, variacao = null, adicionais = []) => {
    const item = {
      id: p.id,
      titulo: p.titulo,
      preco_original: p.preco,
      selectedVariacao: variacao,
      selectedAdicionais: adicionais,
      quantidade: 1,
      tempId: Date.now() + Math.random()
    };
    setCarrinho(prev => [...prev, item]);
    setSelectedProduct(null);
  };

  const removeCarrinho = (tempId) => {
    setCarrinho(prev => prev.filter(i => i.tempId !== tempId));
  };

  const calcularTotal = () => {
    return carrinho.reduce((acc, item) => {
      let preco = Number(item.preco_original);
      if (item.selectedVariacao) preco += Number(item.selectedVariacao.preco_adicional);
      if (item.selectedAdicionais?.length > 0) {
        preco += item.selectedAdicionais.reduce((sum, a) => sum + Number(a.preco), 0);
      }
      return acc + (preco * item.quantidade);
    }, 0);
  };

  const total = calcularTotal();

  useEffect(() => {
    setValorRestante(total - metodosPagamento.reduce((acc, p) => acc + p.valor, 0));
  }, [total, metodosPagamento]);

  const handleAddPagamento = (metodo, valor) => {
    if (valor <= 0) return;
    setMetodosPagamento(prev => [...prev, { metodo, valor: parseFloat(valor) }]);
  };

  const finalizarVenda = async () => {
    if (valorRestante > 0.01) {
      alert(`Faltam R$ ${valorRestante.toFixed(2)} para completar o pagamento.`);
      return;
    }

    setFinalizando(true);
    try {
      const orderData = {
        itens: carrinho.map(i => ({
          id: i.id,
          quantidade: i.quantidade,
          selectedVariacao: i.selectedVariacao,
          selectedAdicionais: i.selectedAdicionais
        })),
        pagamentos: metodosPagamento,
        sessao_id: sessaoAtiva?.id,
        origem_venda: 'pdv'
      };

      const response = await api.post('/orders', orderData);
      if (response.success) {
        setPasso('sucesso');
        setCarrinho([]);
        setMetodosPagamento([]);
        setTimeout(() => setPasso('venda'), 4000);
      } else {
        alert('Erro: ' + response.error);
      }
    } catch (err) {
      alert('Erro de rede ao finalizar');
    } finally {
      setFinalizando(false);
    }
  };

  if (caixaLoading || loading) return <div className="p-8 text-center text-red-500">Iniciando motor gráfico do PDV...</div>;

  if (!sessaoAtiva) return <AbrirCaixaModal />;

  return (
    <div className="pdv-container" style={{ display: 'grid', gridTemplateColumns: '1fr 480px', height: 'calc(100vh - 80px)', background: '#0b0e11', color: '#fff', overflow: 'hidden' }}>
      
      {/* LADO ESQUERDO: GRID DE PRODUTOS */}
      <div className="pdv-main" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'hidden' }}>
        
        {/* HEADER PDV & BUSCA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
           <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} size={20} />
              <input 
                type="text" 
                placeholder="Buscar produto por nome ou código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  padding: '15px 15px 15px 45px', borderRadius: '12px', color: '#fff', outline: 'none'
                }}
              />
           </div>
           <button className="vini-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '52px' }}>
              <User size={18} /> Selecionar Cliente
           </button>
        </div>

        {/* CATEGORIAS (GLASSMORPHISM) */}
        <div style={{ display: 'flex', gap: '0.6rem', overflowX: 'auto', paddingBottom: '5px' }}>
          {categorias.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCat(cat.id)}
              style={{ 
                padding: '12px 20px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                background: activeCat === cat.id ? 'var(--c-red)' : 'rgba(255,255,255,0.03)',
                color: '#fff', fontWeight: '700', whiteSpace: 'nowrap', transition: '0.2s',
                boxShadow: activeCat === cat.id ? '0 10px 15px -3px rgba(239, 68, 68, 0.3)' : 'none'
              }}
            >
              {cat.titulo}
            </button>
          ))}
        </div>

        {/* GRID DE PRODUTOS */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', 
          gap: '1.2rem', 
          overflowY: 'auto',
          paddingRight: '10px'
        }}>
          {produtos.filter(p => (activeCat ? p.categoria_id === activeCat : true) && p.titulo.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
            <div 
              key={p.id} 
              className="pdv-product-card" 
              onClick={() => setSelectedProduct(p)}
              style={{ 
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', 
                padding: '1.2rem', borderRadius: '24px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease'
              }}
            >
              <div style={{ width: '100%', height: '110px', background: 'rgba(0,0,0,0.2)', borderRadius: '20px', marginBottom: '12px', overflow: 'hidden' }}>
                <img 
                  src={p.imagem_url || 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=200'} 
                  alt={p.titulo} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '800' }}>{p.titulo}</h4>
              <strong style={{ color: '#22c55e', fontSize: '1.2rem' }}>R$ {Number(p.preco).toFixed(2)}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* LADO DIREITO: CARRINHO & PAGAMENTO (FRENTE DE CAIXA) */}
      <div className="pdv-sidebar" style={{ background: '#12161b', borderLeft: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* HEADER COLUNA DIREITA */}
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <h3 style={{ margin: 0 }}>Venda Atual</h3>
             <span style={{ fontSize: '0.8rem', color: '#22c55e' }}>● Caixa Aberto ({sessaoAtiva?.id?.substring(0,8)})</span>
           </div>
           <div style={{ display: 'flex', gap: '8px' }}>
              <button className="pdv-util-btn"><Printer size={18} /></button>
              <button className="pdv-util-btn"><MoreVertical size={18} /></button>
           </div>
        </div>

        {passo === 'venda' && (
          <>
            {/* LISTA DE ITENS NO CARRINHO */}
            <div style={{ flex: 1, padding: '1.2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {carrinho.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '6rem', opacity: 0.2 }}>
                   <ShoppingBag size={64} style={{ margin: '0 auto 1rem' }} />
                   <p>Adicione itens para começar</p>
                </div>
              ) : (
                carrinho.map(item => {
                  let precoFinal = Number(item.preco_original);
                  if (item.selectedVariacao) precoFinal += Number(item.selectedVariacao.preco_adicional);
                  if (item.selectedAdicionais?.length > 0) precoFinal += item.selectedAdicionais.reduce((s, a) => s + Number(a.preco), 0);
                  
                  return (
                    <div key={item.tempId} style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '16px', position: 'relative' }}>
                       <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>{item.quantidade}x {item.titulo}</div>
                          {item.selectedVariacao && <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>• {item.selectedVariacao.nome}</div>}
                          {item.selectedAdicionais?.map(a => (
                            <div key={a.id} style={{ fontSize: '0.8rem', opacity: 0.6 }}>+ {a.nome}</div>
                          ))}
                          <div style={{ fontWeight: '900', color: '#22c55e', marginTop: '4px' }}>R$ {(precoFinal * item.quantidade).toFixed(2)}</div>
                       </div>
                       <button onClick={() => removeCarrinho(item.tempId)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={16} color="#ef4444" />
                       </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* RESUMO DE VALORES E BOTÕES FIXOS */}
            <div style={{ padding: '2rem', background: '#1c2229', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '1.2rem', opacity: 0.7 }}>TOTAL À PAGAR</span>
                  <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#22c55e' }}>R$ {Number(total || 0).toFixed(2)}</span>
               </div>
               <button 
                onClick={() => setPasso('pagamento')}
                disabled={carrinho.length === 0}
                className="vini-btn-primary" 
                style={{ width: '100%', padding: '22px', fontSize: '1.4rem', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
               >
                 FINALIZAR VENDA <Zap size={24} fill="currentColor" />
               </button>
            </div>
          </>
        )}

        {passo === 'pagamento' && (
          <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
             <button onClick={() => setPasso('venda')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>
                <ArrowLeft size={18} /> Editar Carrinho
             </button>
             
             <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '20px' }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.6, display: 'block' }}>TOTAL DO PEDIDO</span>
                <h1 style={{ margin: '5px 0', fontSize: '3rem', fontWeight: '900' }}>R$ {Number(total || 0).toFixed(2)}</h1>
                {metodosPagamento.length > 0 && <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Faltam: R$ {Number(valorRestante || 0).toFixed(2)}</span>}
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <button className="pdv-pay-option" onClick={() => handleAddPagamento('dinheiro', valorRestante)}>
                   <DollarSign size={20} /> Dinheiro
                </button>
                <button className="pdv-pay-option" onClick={() => handleAddPagamento('pix', valorRestante)}>
                   <Zap size={20} /> PIX (QR Code)
                </button>
                <button className="pdv-pay-option" onClick={() => handleAddPagamento('cartao_credito', valorRestante)}>
                   <Layers size={20} /> C. Crédito
                </button>
                <button className="pdv-pay-option" onClick={() => handleAddPagamento('cartao_debito', valorRestante)}>
                   <CreditCard size={20} /> C. Débito
                </button>
             </div>

             {/* LISTA DE PAGAMENTOS REGISTRADOS (SPLIT) */}
             <div style={{ flex: 1, overflowY: 'auto' }}>
                {metodosPagamento.map((p, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '12px', marginBottom: '8px' }}>
                     <span style={{ fontWeight: '800' }}>{p.metodo.toUpperCase()}</span>
                     <span style={{ fontWeight: '800' }}>R$ {p.valor.toFixed(2)}</span>
                  </div>
                ))}
             </div>

             <button 
               onClick={finalizarVenda}
               disabled={valorRestante > 0.01 || finalizando}
               className="vini-btn-primary" 
               style={{ width: '100%', padding: '20px', borderRadius: '16px' }}
             >
               {finalizando ? 'Processando...' : 'CONFIRMAR RECEBIMENTO'}
             </button>
          </div>
        )}

        {passo === 'sucesso' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', textAlign: 'center' }}>
              <div style={{ width: '120px', height: '120px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                 <CheckCircle2 size={64} color="#22c55e" />
              </div>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Venda Concluída!</h1>
              <p style={{ opacity: 0.6, marginBottom: '2rem' }}>O cupom está sendo enviado para a impressora padrão.</p>
              <button 
                onClick={() => setPasso('venda')}
                className="vini-btn-outline" 
                style={{ width: '100%', padding: '18px' }}
              >
                Inicar Nova Venda
              </button>
          </div>
        )}
      </div>

      {/* MODAL DE CUSTOMIZAÇÃO (PRODUTO) */}
      {selectedProduct && (
        <ProductModal 
          isOpen={!!selectedProduct} 
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          onAddToCart={(p, v, a) => adicCarrinho(p,v,a)}
          isPDV={true}
        />
      )}

      <style>{`
        .pdv-product-card:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: var(--c-red) !important;
          transform: translateY(-5px);
        }
        .pdv-util-btn {
          width: 44px; height: 44px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: 0.2s;
        }
        .pdv-util-btn:hover { background: var(--c-red); border-color: var(--c-red); }
        .pdv-pay-option {
          padding: 18px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03); color: #fff; font-weight: 800; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 8px; transition: 0.2s;
        }
        .pdv-pay-option:hover { background: rgba(34, 197, 94, 0.1); border-color: #22c55e; }
      `}</style>
    </div>
  );
}

export default PDVBalcao;
