import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  ShoppingBag, Trash2, User, Zap, CreditCard, DollarSign, 
  Plus, Minus, CheckCircle2, XCircle, Search, 
  ArrowLeft, Printer, MoreVertical, Layers, Mail, Store, Truck
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
  
  // Dados do Cliente
  const [clienteNome, setClienteNome] = useState('');
  const [clienteEmail, setClienteEmail] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('retirada'); // retirada, entrega

  // Estados para Split Payment
  const [metodosPagamento, setMetodosPagamento] = useState([]);
  const [valorRestante, setValorRestante] = useState(0);
  
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

    if (!clienteNome) {
      alert("Por favor, insira o nome do cliente.");
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
        cliente_nome: clienteNome,
        cliente_email: clienteEmail,
        tipo_entrega: tipoEntrega,
        pagamentos: metodosPagamento,
        sessao_id: sessaoAtiva?.id,
        origem_venda: 'pdv',
        status: 'preparo' // Venda de balcão vai direto para preparo
      };

      const response = await api.post('/orders', orderData);
      if (response.success) {
        setPasso('sucesso');
        setCarrinho([]);
        setMetodosPagamento([]);
        setClienteNome('');
        setClienteEmail('');
        setTimeout(() => setPasso('venda'), 3000);
      } else {
        alert('Erro: ' + (response.error || 'Falha ao salvar pedido'));
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
    <div className="pdv-premium-page">
      <div className="pdv-main-content">
        
        {/* HEADER DE BUSCA LIGHT */}
        <div className="pdv-header">
           <div className="search-box">
              <Search size={20} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Buscar produto ou código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           
           <div className="delivery-mode-toggles">
              <button 
                className={tipoEntrega === 'retirada' ? 'active' : ''} 
                onClick={() => setTipoEntrega('retirada')}
              >
                <Store size={18} /> Retirada
              </button>
              <button 
                className={tipoEntrega === 'entrega' ? 'active' : ''} 
                onClick={() => setTipoEntrega('entrega')}
              >
                <Truck size={18} /> Entrega
              </button>
           </div>
        </div>

        {/* CATEGORIAS CLARAS */}
        <div className="pdv-categories">
          {categorias.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCat(cat.id)}
              className={activeCat === cat.id ? 'active' : ''}
            >
              {cat.titulo}
            </button>
          ))}
        </div>

        {/* PRODUTOS LIGHT MODE */}
        <div className="pdv-products-grid">
          {produtos.filter(p => (activeCat ? p.categoria_id === activeCat : true) && p.titulo.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
            <div key={p.id} className="pdv-prod-card" onClick={() => setSelectedProduct(p)}>
              <div className="prod-img">
                <img src={p.imagem_url || 'https://via.placeholder.com/150'} alt={p.titulo} />
              </div>
              <div className="prod-info">
                <h3>{p.titulo}</h3>
                <span className="price">R$ {Number(p.preco || 0).toFixed(2)}</span>
              </div>
              <button className="add-btn"><Plus size={18} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* CARRINHO LATERAL - BRANCO E LIMPO */}
      <div className="pdv-sidebar">
        <div className="sidebar-header">
          <h3>Sua Venda</h3>
          <span className="badge">PDV Operativo</span>
        </div>

        {passo === 'venda' && (
          <>
            <div className="customer-info-fields">
               <div className="input-group">
                  <User size={16} color="#94a3b8" />
                  <input 
                    placeholder="Nome do Cliente (Obrigatório)" 
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                  />
               </div>
               <div className="input-group">
                  <Mail size={16} color="#94a3b8" />
                  <input 
                    placeholder="E-mail do Cliente (Opcional)" 
                    value={clienteEmail}
                    onChange={(e) => setClienteEmail(e.target.value)}
                  />
               </div>
            </div>

            <div className="cart-items">
              {carrinho.length === 0 ? (
                <div className="empty-cart">
                   <ShoppingBag size={48} />
                   <p>Adicione itens para começar</p>
                </div>
              ) : (
                carrinho.map(item => {
                  let precoFinal = Number(item.preco_original);
                  if (item.selectedVariacao) precoFinal += Number(item.selectedVariacao.preco_adicional);
                  if (item.selectedAdicionais?.length > 0) precoFinal += item.selectedAdicionais.reduce((s, a) => s + Number(a.preco), 0);
                  
                  return (
                    <div key={item.tempId} className="cart-item">
                       <div className="item-details">
                          <strong>{item.quantidade}x {item.titulo}</strong>
                          {item.selectedVariacao && <span>• {item.selectedVariacao.nome}</span>}
                          <strong className="item-price-val">R$ {(precoFinal * item.quantidade).toFixed(2)}</strong>
                       </div>
                       <button onClick={() => removeCarrinho(item.tempId)} className="remove-btn">
                          <Trash2 size={16} />
                       </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="cart-summary">
               <div className="total-label">
                  <span>Subtotal</span>
                  <strong>R$ {Number(total || 0).toFixed(2)}</strong>
               </div>
               <button 
                 disabled={carrinho.length === 0} 
                 onClick={() => setPasso('pagamento')}
                 className="checkout-btn"
               >
                 PAGAMENTO <Zap size={20} fill="currentColor" />
               </button>
            </div>
          </>
        )}

        {passo === 'pagamento' && (
          <div className="payment-step">
              <button onClick={() => setPasso('venda')} className="back-btn"><ArrowLeft size={16} /> Voltar</button>
              
              <div className="total-display">
                <span className="label">TOTAL A RECEBER</span>
                <span className="value">R$ {Number(total || 0).toFixed(2)}</span>
                {metodosPagamento.length > 0 && <span className="remaining">Faltam: R$ {Number(valorRestante || 0).toFixed(2)}</span>}
              </div>

              <div className="payment-methods">
                <button onClick={() => handleAddPagamento('dinheiro', valorRestante)}><DollarSign /> Dinheiro</button>
                <button onClick={() => handleAddPagamento('pix', valorRestante)}><Zap /> PIX</button>
                <button onClick={() => handleAddPagamento('cartao_credito', valorRestante)}><CreditCard /> Cartão</button>
              </div>

              <div className="payment-history">
                {metodosPagamento.map((p, i) => (
                  <div key={i} className="pay-tag">{p.metodo}: R$ {p.valor.toFixed(2)}</div>
                ))}
              </div>

              <button 
                onClick={finalizarVenda}
                disabled={valorRestante > 0.01 || finalizando}
                className="confirm-btn"
              >
                {finalizando ? 'Gravando Pedido...' : 'FINALIZAR E IMPRIMIR'}
              </button>
          </div>
        )}

        {passo === 'sucesso' && (
          <div className="success-step">
              <CheckCircle2 size={80} color="#22c55e" />
              <h2>Venda Realizada!</h2>
              <p>O pedido foi enviado para a cozinha.</p>
          </div>
        )}
      </div>

      <style>{`
        .pdv-premium-page {
          display: grid;
          grid-template-columns: 1fr 420px;
          height: calc(100vh - 80px);
          background: #f1f5f9;
          color: #1e293b;
          font-family: 'Inter', sans-serif;
        }

        .pdv-main-content { padding: 1.5rem; display: flex; flexDirection: column; gap: 1rem; overflow: hidden; }

        .pdv-header { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
        .search-box { 
          flex: 1; display: flex; align-items: center; gap: 10px; background: #fff; padding: 0.8rem 1.2rem; 
          border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .search-box input { border: none; outline: none; width: 100%; font-weight: 500; color: #0f172a; }

        .delivery-mode-toggles { display: flex; background: #fff; padding: 4px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .delivery-mode-toggles button { 
          border: none; background: transparent; padding: 8px 16px; border-radius: 8px; cursor: pointer;
          display: flex; align-items: center; gap: 6px; font-weight: 700; color: #94a3b8; transition: 0.2s;
        }
        .delivery-mode-toggles button.active { background: #3b82f6; color: #fff; }

        .pdv-categories { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; }
        .pdv-categories button { 
          background: #fff; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 10px; cursor: pointer;
          font-weight: 700; color: #64748b; white-space: nowrap; transition: 0.2s;
        }
        .pdv-categories button.active { background: #0f172a; color: #fff; border-color: #0f172a; }

        .pdv-products-grid { 
          display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; 
          overflow-y: auto; padding-right: 8px; 
        }
        .pdv-prod-card { 
          background: #fff; border-radius: 16px; padding: 1rem; cursor: pointer; border: 1px solid #e2e8f0;
          transition: all 0.2s; display: flex; flex-direction: column;
        }
        .pdv-prod-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); border-color: #3b82f6; }
        .prod-img { width: 100%; height: 120px; border-radius: 12px; margin-bottom: 12px; overflow: hidden; background: #f8fafc; }
        .prod-img img { width: 100%; height: 100%; object-fit: cover; }
        .prod-info h3 { margin: 0; font-size: 0.95rem; font-weight: 800; color: #0f172a; }
        .prod-info .price { color: #22c55e; font-weight: 800; font-size: 1.1rem; }

        .pdv-sidebar { background: #fff; border-left: 1px solid #e2e8f0; display: flex; flex-direction: column; overflow: hidden; }
        .sidebar-header { padding: 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .sidebar-header h3 { margin: 0; font-weight: 800; color: #0f172a; }
        .badge { background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: 800; }

        .customer-info-fields { padding: 1rem 1.5rem; background: #f8fafc; border-bottom: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 8px; }
        .input-group { display: flex; align-items: center; gap: 8px; background: #fff; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 8px; }
        .input-group input { border: none; outline: none; flex: 1; font-size: 0.85rem; }

        .cart-items { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .cart-item { display: flex; justify-content: space-between; gap: 12px; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; }
        .item-details { display: flex; flex-direction: column; gap: 2px; }
        .item-price-val { color: #22c55e; font-weight: 800; }
        .remove-btn { color: #ef4444; border: none; background: transparent; cursor: pointer; }

        .cart-summary { padding: 1.5rem; border-top: 1px solid #e2e8f0; }
        .total-label { display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 1.2rem; font-weight: 800; }
        .checkout-btn { width: 100%; padding: 20px; background: #3b82f6; color: #fff; border-radius: 12px; border: none; font-weight: 900; font-size: 1.2rem; cursor: pointer; }

        .payment-step { padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .total-display { text-align: center; padding: 1.5rem; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; }
        .total-display .label { font-size: 0.8rem; font-weight: 800; color: #64748b; }
        .total-display .value { display: block; font-size: 2.5rem; font-weight: 900; color: #0f172a; }
        .total-display .remaining { color: #ef4444; font-weight: 800; }

        .payment-methods { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .payment-methods button { padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px; font-weight: 800; font-size: 0.75rem; color: #64748b; }
        .payment-methods button:hover { background: #f1f5f9; border-color: #3b82f6; color: #3b82f6; }

        .payment-history { display: flex; flex-wrap: wrap; gap: 6px; }
        .pay-tag { background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
        .confirm-btn { width: 100%; padding: 18px; background: #22c55e; color: #fff; border-radius: 12px; border: none; font-weight: 900; font-size: 1.1rem; cursor: pointer; }

        .success-step { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; }
        .success-step h2 { margin-top: 1rem; font-weight: 900; }
      `}</style>
    </div>
  );
}

export default PDVBalcao;
