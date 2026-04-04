import React from 'react';
import { menuItems, categories } from '../../lib/siteData';

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
          {Object.entries(categories).map(([key, value]) => (
            <button 
              key={key} 
              className={`tbtn ${activeTab === key ? 'on' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="sec">
        {categoryEntries.map(([category, items]) => (
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
                    {item.badge && <span className={`ibadge ${item.badgeClass}`}>{item.badge}</span>}
                    <div className="iname">{item.title}</div>
                    <div className="idesc">{item.description}</div>
                    <div className="ifoot">
                      <span className="iprice">{item.price}</span>
                      <div className="ibtns">
                        <button 
                          onClick={() => window.location.href = '/login.vinis'} 
                          className="ibtn ibtn-r"
                          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          🛒 Comprar no Portal
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
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
