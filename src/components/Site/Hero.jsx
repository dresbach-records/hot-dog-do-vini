import React from 'react';
import { Star, ShoppingCart, MessageSquare } from 'lucide-react';

const Hero = () => (
  <section className="vini-site-wrapper vini-hero">
    <div className="vini-hero-container">
      <div className="vini-hero-content">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div className="vini-hero-badge">
            <Star size={14} fill="currentColor" /> 4.9 no iFood
          </div>
          <div className="vini-hero-badge vini-hero-badge-green">
            ● Aberto agora
          </div>
        </div>
        
        <h1>Hot Dog<br /><span>do Vini</span></h1>
        
        <p>
          O melhor hot dog artesanal, feito na hora e entregue quentinho em Taquara/RS. 
          Sabor que você conhece, qualidade que você confia.
        </p>
        
        <div className="vini-hero-btns">
          <a href="https://www.ifood.com.br/delivery/taquara-rs/hot-dog-do-vini-recreio" target="_blank" className="btn-ifood">
             <ShoppingCart size={18} /> Pedir no iFood
          </a>
          <a href="https://pedido.anota.ai/loja/marcos-vinicius-dresbach-do-amaral-ltda?f=msa" target="_blank" className="btn-anota-ai">
             <MessageSquare size={18} /> Pedir no Anota Aí
          </a>
        </div>
        
        <div className="vini-hero-stats">
          <div className="vini-stat-item">
            <span className="vini-stat-val">4.9★</span>
            <span className="vini-stat-label">Avaliação</span>
          </div>
          <div className="vini-stat-item">
            <span className="vini-stat-val">~35min</span>
            <span className="vini-stat-label">Entrega</span>
          </div>
          <div className="vini-stat-item">
            <span className="vini-stat-val">10+</span>
            <span className="vini-stat-label">Opções</span>
          </div>
          <div className="vini-stat-item">
            <span className="vini-stat-val">R$ 25</span>
            <span className="vini-stat-label">Ped. Mín.</span>
          </div>
        </div>
      </div>
      
      <div className="vini-hero-logo">
        <img src="/Logo-VINI.png" alt="Vini's Logo" />
      </div>
    </div>
  </section>
);

export default Hero;
