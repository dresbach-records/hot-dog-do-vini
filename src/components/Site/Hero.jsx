import React from 'react';
import { Star, ChevronRight, Flame, Bike, Layers } from 'lucide-react';

const Hero = () => (
  <div className="hero-sec">
    <div className="hero-max">
      
      <div className="hero-grid">
        {/* Left Content Area */}
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-rating"><Star size={16} fill="currentColor" /> 4.9 no iFood</span>
            <span className="hero-status"><span className="status-dot"></span> Aberto agora</span>
          </div>
          
          <h1 className="hero-title">Hot Dog do Vini</h1>
          <p className="hero-desc">
            O melhor hot dog artesanal, feito na hora e entregue quentinho em Taquara/RS.
          </p>
          
          <div className="hero-cta-group">
            <a href="https://www.ifood.com.br/delivery/taquara-rs/hot-dog-do-vini-recreio" target="_blank" rel="noreferrer" className="hcta hcta-ifood">
              <span className="hcta-logo-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>
              </span>
              Pedir pelo iFood
              <ChevronRight size={18} />
            </a>
            <a href="https://pedido.anota.ai/loja/marcos-vinicius-dresbach-do-amaral-ltda?f=msa" target="_blank" rel="noreferrer" className="hcta hcta-anota">
              <span className="hcta-logo-wrap anota-logo-wrap">
                Aí
              </span>
              Pedir pelo Anota Aí
              <ChevronRight size={18} color="#999" />
            </a>
          </div>
        </div>

        {/* Right Promo Graphic Area */}
        <div className="hero-promo-wrapper">
          <img src="/present.png" alt="Promo Vini's" className="promo-gift-huge" />
        </div>
      </div>

      <div className="hero-divider"></div>

      {/* Bottom Stats Row */}
      <div className="hero-stats-row">
        <div className="hstat-item">
          <div className="hstat-val"><Flame size={20} color="#EA1D2C" /> 4.9<span className="hstat-sub">/5</span></div>
          <div className="hstat-lbl">AVALIAÇÃO</div>
        </div>
        <div className="hstat-item">
          <div className="hstat-val"><Bike size={20} color="#3b82f6" /> ~35 min</div>
          <div className="hstat-lbl">ENTREGA</div>
        </div>
        <div className="hstat-item">
          <div className="hstat-val"><Layers size={20} color="#eab308" /> 10+</div>
          <div className="hstat-lbl">OPÇÕES</div>
        </div>
        <div className="hstat-item hide-border">
          <div className="hstat-val">R$25</div>
          <div className="hstat-lbl">PEDIDO MÍN.</div>
        </div>
      </div>

    </div>
  </div>
);

export default Hero;
