import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Clock, ArrowRight, ArrowLeft, MoreHorizontal, 
  AlertCircle, CheckCircle2, Truck, ChefHat, 
  Plus, Search, User, MapPin, CreditCard, X, Volume2
} from 'lucide-react';
import '../styles/admin/pedidos.css';

function Pedidos() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPDVOpen, setIsPDVOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableProducts, setAvailableProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  
  // PDV Local State
  const [newOrder, setNewOrder] = useState({
    customer_id: null,
    customer_name: '',
    customer_phone: '',
    items: [],
    total: 0,
    payment_method: 'Dinheiro',
    address: { bairro: 'Balcão', rua: 'Retirada Local' }
  });

  const lastOrderCount = useRef(0);
  const audioContext = useRef(null);

  // Busca Inteligente de Cliente (Estilo Anota AI)
  const searchCustomer = async (term) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const { data } = await supabase
      .from('clientes')
      .select('id, nome, telefone, endereco_padrao')
      .or(`nome.ilike.%${term}%,telefone.ilike.%${term}%`)
      .limit(5);
    
    setSearchResults(data || []);
  };

  const selectCustomer = (customer) => {
    setNewOrder({
      ...newOrder,
      customer_id: customer.id,
      customer_name: customer.nome,
      customer_phone: customer.telefone || '',
      address: customer.endereco_padrao || { bairro: 'Balcão', rua: 'Retirada Local' }
    });
    setSearchResults([]);
  };

  // Status flow
  const statusFlow = ['novos', 'preparo', 'entrega', 'finalizado'];

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      if (data.length > lastOrderCount.current && lastOrderCount.current !== 0) {
        handleNewOrderAlert(data[0]);
      }
      setOrders(data || []);
      lastOrderCount.current = data.length;
    }
    setLoading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('produtos').select('*').eq('disponivel', true);
    setAvailableProducts(data || []);
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();

    // REAL-TIME SUBSCRIPTION (ESTILO ANOTA AI)
    const subscription = supabase
      .channel('pedidos-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleNewOrderAlert = (order) => {
    // 1. Som de Alerta (Ding Dong)
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log("Audio play blocked by browser. Click anywhere to enable."));

    // 2. Síntese de Voz (Estilo Anota AI)
    const msg = new SpeechSynthesisUtterance();
    msg.text = `Novo pedido de ${order.cliente_nome || 'Cliente'}`;
    msg.lang = 'pt-BR';
    msg.rate = 0.9;
    window.speechSynthesis.speak(msg);
  };

  const moveOrder = async (orderId, direction) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const currentIndex = statusFlow.indexOf(order.status);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < statusFlow.length) {
      const newStatus = statusFlow[newIndex];
      const { error } = await supabase
        .from('pedidos')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (!error) fetchOrders();
    }
  };

  const handleAddManualOrder = async () => {
    const payload = {
      ...newOrder,
      status: 'novos',
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('pedidos').insert([payload]);
    if (!error) {
      setIsPDVOpen(false);
      fetchOrders();
    } else {
      alert('Erro ao lançar pedido manual');
    }
  };

  const getOrdersByStatus = (status) => orders.filter(o => o.status === status);

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'novos': return <AlertCircle size={18} />;
      case 'preparo': return <ChefHat size={18} />;
      case 'entrega': return <Truck size={18} />;
      case 'finalizado': return <CheckCircle2 size={18} />;
      default: return null;
    }
  };

  const renderColumn = (title, status, className) => {
    const columnOrders = getOrdersByStatus(status);
    
    return (
      <div className={`kanban-column ${className}`}>
        <div className="kanban-column-header">
          <div className="kanban-column-title">
            <StatusIcon status={status} />
            {title}
          </div>
          <span className="vini-badge-kanban">{columnOrders.length}</span>
        </div>
        
        <div className="kanban-cards-container">
          {columnOrders.map(order => {
            const timeAgo = Math.floor((new Date() - new Date(order.created_at || Date.now())) / 60000);
            
            return (
              <div key={order.id} className={`kanban-card status-${status}`}>
                <div className="card-header">
                  <span className="order-id">#{order.id.toString().slice(-4)}</span>
                  <span className={`order-time ${timeAgo > 20 ? 'urgent' : ''}`}>
                    <Clock size={12} /> {timeAgo}m
                  </span>
                </div>
                
                <div className="customer-name">{order.cliente_nome || 'Cliente Balcão'}</div>
                
                <div className="order-context-info">
                   <div className="info-item"><MapPin size={12} /> {order.endereco?.bairro || 'Retirada'}</div>
                   <div className="info-item"><CreditCard size={12} /> {order.forma_pagamento || 'Dinheiro'}</div>
                </div>

                <div className="order-items">{order.itens_snapshot || 'Itens não detalhados'}</div>
                
                <div className="card-footer">
                  <span className="order-total">
                    R$ {Number(order.total || 0).toFixed(2).replace('.', ',')}
                  </span>
                  
                  <div className="card-actions">
                    {status !== 'novos' && (
                      <button className="action-btn" onClick={() => moveOrder(order.id, 'prev')} title="Voltar etapa">
                        <ArrowLeft size={16} />
                      </button>
                    )}
                    {status !== 'finalizado' && (
                      <button className="action-btn" onClick={() => moveOrder(order.id, 'next')} title="Avançar etapa">
                        <ArrowRight size={16} />
                      </button>
                    )}
                    <button className="action-btn" title="Mais opções">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {columnOrders.length === 0 && (
            <div style={{ textAlign: 'center', opacity: 0.5, padding: '2rem 0', fontSize: '0.9rem' }}>
              Nenhum pedido aqui
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header className="dashboard-header" style={{ flexShrink: 0 }}>
        <div>
          <h2>Gestão de Pedidos 🔥</h2>
          <p>Operação em tempo real (Real-time ativado)</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <div className="vini-glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
             <Volume2 size={16} color="var(--c-green)" /> Áudio Ativo
           </div>
           <button className="btn vini-btn-primary" onClick={() => setIsPDVOpen(true)}>
             <Plus size={18} /> Novo Pedido Manual
           </button>
        </div>
      </header>

      <div className="kanban-board">
        {renderColumn('Novos', 'novos', 'column-novos')}
        {renderColumn('Em Preparo', 'preparo', 'column-preparo')}
        {renderColumn('Saiu p/ Entrega', 'entrega', 'column-entrega')}
        {renderColumn('Finalizados', 'finalizado', 'column-finalizado')}
      </div>

      {/* MODAL PDV MANUAL (ESTILO ANOTA AI) */}
      {isPDVOpen && (
        <div className="vini-modal-overlay">
           <div className="vini-glass-panel pdv-modal">
              <div className="pdv-header">
                 <h3>Novo Pedido Manual (Balcão)</h3>
                 <button onClick={() => setIsPDVOpen(false)}><X /></button>
              </div>
              
              <div className="pdv-body">
                 <div className="pdv-section">
                    <h4>Cliente (Nome ou WhatsApp)</h4>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="text" 
                        placeholder="Pesquisar ou digitar novo nome..." 
                        className="vini-input-dark"
                        value={newOrder.customer_name}
                        onChange={e => {
                          setNewOrder({...newOrder, customer_name: e.target.value});
                          searchCustomer(e.target.value);
                        }}
                      />
                      {searchResults.length > 0 && (
                        <div className="pdv-search-dropdown">
                          {searchResults.map(c => (
                            <div key={c.id} className="pdv-search-item" onClick={() => selectCustomer(c)}>
                              <div style={{ fontWeight: '700' }}>{c.nome}</div>
                              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{c.telefone || 'Sem telefone'}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="WhatsApp (Opcional)" 
                        className="vini-input-dark" 
                        style={{ fontSize: '0.8rem' }}
                        value={newOrder.customer_phone}
                        onChange={e => setNewOrder({...newOrder, customer_phone: e.target.value})}
                      />
                      <input 
                        type="text" 
                        placeholder="CPF/CNPJ (Opcional)" 
                        className="vini-input-dark" 
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                 </div>

                 <div className="pdv-section">
                    <h4>Produtos</h4>
                    <div className="pdv-product-search">
                       <Search size={16} />
                       <input type="text" placeholder="Buscar no cardápio..." />
                    </div>
                    <div className="pdv-product-list">
                       {availableProducts.slice(0, 5).map(p => (
                         <div key={p.id} className="pdv-item-row" onClick={() => alert('Item adicionado')}>
                            <span>{p.titulo}</span>
                            <span style={{ color: 'var(--c-green)' }}>R$ {p.preco}</span>
                            <Plus size={14} />
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="pdv-footer">
                 <button className="btn btn-secondary" onClick={() => setIsPDVOpen(false)}>Cancelar</button>
                 <button className="btn vini-btn-primary" onClick={handleAddManualOrder}>Finalizar Pedido</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default Pedidos;
