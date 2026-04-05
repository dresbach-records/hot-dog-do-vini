import React from 'react';
import { menuItems, categories } from '../../lib/siteData';
import { Flame } from 'lucide-react';

const iconsData = {
  promocoes: { 
    bg: '#FEF2F2', color: '#DC2626', 
    icon: <Flame size={28} strokeWidth={2.5} color="#DC2626" /> 
  },
  destaques: { 
    bg: '#FEF2F2', color: '#EF4444', 
    icon: <Flame size={28} strokeWidth={2.5} color="#EF4444" /> 
  },
  hotdog: { 
    bg: '#FEFCE8', color: '#F97316', 
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 16 L16 4 C18 2, 22 6, 20 8 L8 20 C6 22, 2 18, 4 16 Z" />
        <path d="M9 16 L15 10" />
      </svg>
    ) 
  },
  burgers: { 
    bg: '#FCE7F3', color: '#E11D48', 
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4C7 4 3.5 7 3 10H21C20.5 7 17 4 12 4z" />
        <rect x="3" y="12" width="18" height="3" rx="1.5" />
        <path d="M3 17C3 19 6 20 12 20C18 20 21 19 21 17H3z" />
      </svg>
    ) 
  },
  combos: { 
    bg: '#FEFCE8', color: '#EA580C', 
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="21 8 21 21 3 21 3 8" />
        <rect x="1" y="3" width="22" height="5" />
        <line x1="12" y1="21" x2="12" y2="8" />
      </svg>
    ) 
  },
  batatas: { 
    bg: '#F0F9FF', color: '#EAB308', 
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 10L7 20H17L18 10H6z" />
        <path d="M7 10L6 4" />
        <path d="M10 10L10 3" />
        <path d="M14 10L14 3" />
        <path d="M17 10L18 4" />
      </svg>
    ) 
  },
  bebidas: { 
    bg: '#EFF6FF', color: '#3B82F6', 
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 6L8 20H16L17 6" />
        <path d="M6 6H18" />
        <path d="M14 6L14 2L10 2" />
      </svg>
    ) 
  }
};

const Menu = ({ activeTab, setActiveTab }) => {
  const filteredItems = activeTab === 'todos' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeTab);

  const groupedItems = filteredItems.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const categoryEntries = Object.entries(groupedItems);

  return (
    <div className="bg-[#f7f7f7]" id="cardapio">
      <div className="tabs-row">
        <div className="tbin">
          {Object.entries(categories).map(([key, text]) => {
            if (key === 'todos') return null;
            const style = iconsData[key] || iconsData.hotdog;
            const isActive = activeTab === key;
            return (
              <button 
                key={key} 
                className={`tbtn-card ${isActive ? 'on' : ''}`}
                onClick={() => setActiveTab(key)}
                style={{
                  background: style.bg,
                  borderLeftColor: isActive ? style.color : 'transparent'
                }}
              >
                <div className="tbtn-icon-wrap" style={{ color: style.color }}>{style.icon}</div>
                <div className="tbtn-label" style={{ color: isActive ? style.color : '#4b5563', fontWeight: isActive ? 800 : 700 }}>{text}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="sec">
        {activeTab === 'promocoes' ? (
          <div className="promo-destaque-container">
            <div className="promo-destaque-head">
              <h2>Ofertas Imperdíveis</h2>
              <p>Aproveite os nossos combos e lanches selecionados com desconto para você!</p>
            </div>
            <div className="promo-cards-wrap">
              {filteredItems.map((item) => (
                <div key={item.title} className="promo-card-huge">
                  <div className="promo-card-huge-img-wrap">
                    <img src={item.image} alt={item.title} className="promo-card-huge-img" />
                    {item.badge && <span className={`ivini-badge ${item.badgeClass}`}>{item.badge}</span>}
                  </div>
                  <div className="promo-card-huge-body">
                    <div className="promo-card-huge-title">{item.title}</div>
                    <div className="promo-card-huge-desc">{item.description}</div>
                    <div className="promo-card-huge-foot">
                      <div className="promo-card-prices">
                        {item.oldPrice && <span className="promo-old-price">{item.oldPrice}</span>}
                        <span className="promo-new-price">{item.price}</span>
                      </div>
                      <button 
                        onClick={() => window.location.href = `/login.vinis?redirectTo=/cliente.vinis`} 
                        className="ibtn ibtn-r promo-cta-btn"
                      >
                        🛒 Pegar Oferta
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          categoryEntries.map(([category, items]) => (
            <div key={category} className="cat-group">
              <div className="cttl">{categories[category]}</div>
              <div className="mgrid">
                {items.map((item) => (
                  <div key={item.title} className="icard">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="ithumb"
                      style={{ height: 'auto', width: '100%' }}
                    />
                    <div className="ibody">
                      {item.badge && <span className={`ivini-badge ${item.badgeClass}`}>{item.badge}</span>}
                      <div className="iname">{item.title}</div>
                      <div className="idesc">{item.description}</div>
                      <div className="ifoot">
                        <span className="iprice">{item.price}</span>
                        <div className="ibtns">
                          <button 
                            onClick={() => window.location.href = `/login.vinis?redirectTo=/cliente.vinis`} 
                            className="ibtn ibtn-r"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                          >
                            🛒 Ver Oferta no Portal
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="sec" style={{ textAlign: 'center', padding: '20px' }}>
        <p style={{ fontStyle: 'italic', color: '#888', fontSize: '12px' }}>Imagens meramente ilustrativas.</p>
        <p style={{ fontStyle: 'italic', color: '#888', marginTop: '10px', fontSize: '12px' }}>
          Para convênios corporativos, acesse o portal administrativo.
        </p>
      </div>
    </div>
  );
}

export default Menu;
