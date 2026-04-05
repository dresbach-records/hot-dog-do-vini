import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowToOrder = () => (
  <div className="how-sec" id="como-pedir">
    <div className="sec">
      <div className="hhead">
        <div className="sttl">Como pedir?</div>
        <p className="ssub">Escolha a melhor forma — chega sempre <strong>quente</strong> e rápido.</p>
      </div>
      
      <div className="howto-grid">
        {/* Card 1: iFood */}
        <div className="howto-card">
           <div className="howto-card-title">🍔 <span style={{color: '#ea1d2c', fontWeight: 800, marginLeft: '6px'}}>iFood</span></div>
           <ul className="howto-list">
             <li>Escolha seu lanche</li>
             <li>Adicione ao carrinho</li>
             <li>Finalize no app</li>
             <li>Acompanhe a entrega</li>
           </ul>
           <a href="https://www.ifood.com.br/delivery/taquara-rs/hot-dog-do-vini-recreio" target="_blank" rel="noreferrer" className="howto-btn howto-btn-gray">
             Abrir no iFood
           </a>
        </div>

        {/* Card 2: Anota Aí */}
        <div className="howto-card">
           <div className="howto-card-title">💬 <span style={{color: '#334155', fontWeight: 800, marginLeft: '6px'}}>Anota Aí</span></div>
           <ul className="howto-list">
             <li>Acesse o cardápio</li>
             <li>Escolha seus itens</li>
             <li>Informe endereço</li>
             <li>Receba confirmação</li>
           </ul>
           <a href="https://pedido.anota.ai/loja/marcos-vinicius-dresbach-do-amaral-ltda?f=msa" target="_blank" rel="noreferrer" className="howto-btn howto-btn-gray">
             Pedir pelo Anota Aí
           </a>
        </div>

        {/* Card 3: Portal Vini's */}
        <div className="howto-card howto-portal-card">
           <div className="howto-card-title">🎁 <span style={{color: '#b91c1c', fontWeight: 800, marginLeft: '6px'}}>Portal Vini's</span></div>
           <ul className="howto-list list-checkmarks">
             <li><span style={{color: '#ea1d2c', fontWeight: 800, marginRight: '8px'}}>✔</span> <span><strong>Pedido direto</strong> e rápido</span></li>
             <li><span style={{color: '#ea1d2c', fontWeight: 800, marginRight: '8px'}}>✔</span> <span><strong>Sem filas</strong> externas</span></li>
             <li><span style={{color: '#ea1d2c', fontWeight: 800, marginRight: '8px'}}>✔</span> <span><strong>Concorra a prêmios</strong></span></li>
           </ul>
           <Link to="/login.vinis" className="howto-btn howto-btn-portal">
             <Flame size={18} fill="currentColor" color="#fbbf24" strokeWidth={1} style={{marginRight: '6px'}}/> Pedir no Portal <ArrowRight size={18} strokeWidth={3} style={{marginLeft: 'auto'}}/>
           </Link>
        </div>

      </div>
    </div>
  </div>
);

export default HowToOrder;
