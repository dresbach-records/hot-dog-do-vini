import { Clock, CreditCard, MapPin, Package } from 'lucide-react';

const PlatformStrip = () => (
  <div className="vini-site-wrapper" style={{ background: '#EA1D2C', color: '#fff', padding: '15px 5%' }}>
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: '20px',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Clock size={24} />
        <div>
          <div style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>Seg a Qui</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>18:30 – 23h</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ opacity: 0.8 }}><CreditCard size={24} /></div>
        <div>
          <div style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>Pagamento</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Pix, Cartões e Vale</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Package size={24} />
        <div>
          <div style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>Pedido Mín.</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>R$ 25,00</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <MapPin size={24} />
        <div>
          <div style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>Atendemos</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>Taquara, Igrejinha e Parobé</div>
        </div>
      </div>
    </div>
  </div>
);

export default PlatformStrip;
