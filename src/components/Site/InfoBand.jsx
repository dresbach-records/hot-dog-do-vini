import React from 'react';
import { Clock, CreditCard, MapPin, Zap, StopCircle } from 'lucide-react'; // Using standard lucide icons

const InfoBand = () => (
  <div className="ib-wrapper">
    <div className="ib-card">
      <div className="ib-row ib-row-top">
        <div className="ib-col">
          <div className="ib-icon-wrap"><Clock size={28} /></div>
          <div className="ib-content">
            <div className="ib-label">HORÁRIO DE FUNCIONAMENTO</div>
            <div className="ib-val-highlight">Seg a Qui 18:30 - 23h</div>
          </div>
        </div>
        <div className="ib-col">
          <div className="ib-icon-wrap"><CreditCard size={28} /></div>
          <div className="ib-content">
            <div className="ib-label">FORMAS DE PAGAMENTO</div>
            <div className="ib-val-highlight">Pix, Cartões e Vale</div>
          </div>
        </div>
        <div className="ib-col">
          <div className="ib-icon-wrap"><MapPin size={28} /></div>
          <div className="ib-content">
            <div className="ib-label">ÁREA DE ENTREGA</div>
            <div className="ib-val-highlight">Taquara, Igrejinha e Parobé</div>
          </div>
        </div>
      </div>
      
      <div className="ib-row ib-row-bottom">
        <div className="ib-col-sub">
          <Clock size={20} />
          <div className="ib-sub-text">
            <strong>Seg a Qui</strong> 18:30 - 23h<br/>
            <strong>Sex</strong> 14h - 23h | <strong>Sáb e Dom</strong> 08h - 23h
          </div>
        </div>
        <div className="ib-col-sub">
          <Zap size={24} color="#3b82f6" />
          <div className="ib-sub-text">
            <span style={{fontSize: '15px', fontWeight: '800'}}>Entrega rápida</span><br/>
            Pix • Cartões • Vale
          </div>
        </div>
        <div className="ib-col-sub">
          <CreditCard size={24} color="#facc15" />
          <div className="ib-sub-text">
            Pedido mínimo<br/>
            <span style={{fontSize: '30px', fontWeight: '900', color: '#fff', lineHeight: 1}}>R$ 25,00</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default InfoBand;
