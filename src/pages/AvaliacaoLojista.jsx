import React, { useState } from 'react';
import { 
  Star, MessageCircle, Truck, Package, 
  ChevronRight, Filter, Download, Info,
  Search, TrendingUp, ThumbsUp, ThumbsDown
} from 'lucide-react';
import '../styles/admin/dashboard.css';

function AvaliacaoLojista() {
  const [reviews, setReviews] = useState([
    { id: 1, cliente: 'Ana Silva', nota: 5, comentario: 'O Cachorrão tava incrível! Chegou bem quentinho.', data: '12/04/2026', item: 'Hot Dog Mestre', entrega: 5 },
    { id: 2, cliente: 'Carlos Melo', nota: 4, comentario: 'Muito bom, mas a batata palha veio um pouco murcha.', data: '11/04/2026', item: 'Combo Duplo', entrega: 4 },
    { id: 3, cliente: 'Bruna Souza', nota: 5, comentario: 'Entrega mega rápida! Parabéns.', data: '10/04/2026', item: 'Hot Dog Simples', entrega: 5 }
  ]);

  return (
    <div className="admin-page-container">
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
           <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Avaliações</h1>
           <p style={{ opacity: 0.6 }}>O que seus clientes estão dizendo sobre você</p>
        </div>
        <div className="header-actions">
           <button className="vini-btn-outline"><Download size={18}/> EXPORTAR FEEDBACKS</button>
        </div>
      </header>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
         <div className="vini-glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>MÉDIA GERAL</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, margin: '5px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              4.8 <Star size={24} fill="#f1c40f" color="#f1c40f"/>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#27ae60' }}>Excelente (Top 5% da região)</div>
         </div>
         <div className="vini-glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>QUALIDADE COMIDA</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, margin: '5px 0' }}>4.9</div>
            <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.6 }}>Baseado em 128 notas</p>
         </div>
         <div className="vini-glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>QUALIDADE ENTREGA</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, margin: '5px 0' }}>4.7</div>
            <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.6 }}>Baseado em 95 notas</p>
         </div>
         <div className="vini-glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '0.8rem', fontWeight: 700 }}>RECORRÊNCIA</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, margin: '5px 0' }}>82%</div>
            <div style={{ color: '#27ae60', fontSize: '0.75rem', fontWeight: 700 }}>Clientes que voltaram</div>
         </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
         
         {/* LISTA DE COMENTÁRIOS */}
         <div className="vini-glass-panel" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
               <h3 style={{ margin: 0 }}>Comentários recentes</h3>
               <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="vini-btn-outline" style={{ padding: '5px 15px', fontSize: '0.75rem' }}>TODAS</button>
                  <button className="vini-btn-outline" style={{ padding: '5px 15px', fontSize: '0.75rem' }}>CRÍTICAS</button>
               </div>
            </div>
            
            <div className="reviews-list">
               {reviews.map(rev => (
                 <div key={rev.id} style={{ padding: '1.5rem', borderBottom: '1px solid #f9f9f9', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '40px', height: '40px', background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{rev.cliente.charAt(0)}</div>
                          <div>
                            <strong style={{ display: 'block' }}>{rev.cliente}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#999' }}>{rev.data} • Pedido #{rev.id + 100}</span>
                          </div>
                       </div>
                       <div style={{ display: 'flex', gap: '2px' }}>
                         {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= rev.nota ? '#f1c40f' : 'none'} color={s <= rev.nota ? '#f1c40f' : '#ddd'} />)}
                       </div>
                    </div>
                    <p style={{ margin: '15px 0', fontSize: '0.95rem', color: '#333', fontStyle: 'italic' }}>"{rev.comentario}"</p>
                    <div style={{ display: 'flex', gap: '20px' }}>
                       <div style={{ fontSize: '0.75rem', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Package size={14}/> <strong>Produto:</strong> {rev.item}
                       </div>
                       <div style={{ fontSize: '0.75rem', color: '#666', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Truck size={14}/> <strong>Entrega:</strong> {rev.entrega}/5
                       </div>
                    </div>
                    <button style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', background: '#333', color: '#fff', border: 'none', padding: '5px 15px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>RESPONDER</button>
                 </div>
               ))}
            </div>
         </div>

         {/* INSIGHTS DE ITENS */}
         <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
               <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Destaques Positivos</h3>
               <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ background: '#f0fff4', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #27ae60' }}>
                     <strong style={{ fontSize: '0.85rem' }}>Sabor do Tempero</strong>
                     <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Mencionado por 42 clientes</div>
                  </div>
                  <div style={{ background: '#f0fff4', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #27ae60' }}>
                     <strong style={{ fontSize: '0.85rem' }}>Velocidade na Entrega</strong>
                     <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Mencionado por 38 clientes</div>
                  </div>
               </div>
            </div>

            <div className="vini-glass-panel" style={{ padding: '1.5rem' }}>
               <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Oportunidades de Melhoria</h3>
               <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={{ background: '#fff5f5', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #e74c3c' }}>
                     <strong style={{ fontSize: '0.85rem' }}>Temperatura da Batata</strong>
                     <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Mencionado por 5 clientes</div>
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}

export default AvaliacaoLojista;
