import React from 'react';
import { ShoppingCart, MessageSquare, Utensils } from 'lucide-react';
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
    <section className="vini-site-wrapper" id="cardapio" style={{ backgroundColor: '#f8fafc', padding: '80px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%' }}>
        
        <h2 className="vini-section-title">
          <Utensils size={32} color="#dc2626" /> Nosso Cardápio
        </h2>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '50px', flexWrap: 'wrap' }}>
          {Object.entries(categories).map(([key, value]) => (
            <button 
              key={key} 
              onClick={() => setActiveTab(key)}
              style={{
                padding: '10px 24px',
                borderRadius: '50px',
                border: 'none',
                backgroundColor: activeTab === key ? '#dc2626' : '#fff',
                color: activeTab === key ? '#fff' : '#64748b',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                transition: 'all 0.2s'
              }}
            >
              {value}
            </button>
          ))}
        </div>

        {/* Categories and Items */}
        {categoryEntries.map(([category, items]) => (
          <div key={category} style={{ marginBottom: '60px' }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              marginBottom: '30px', 
              color: '#1e293b',
              borderLeft: '4px solid #dc2626',
              paddingLeft: '15px'
            }}>
              {categories[category]}
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '30px' 
            }}>
              {items.map((item) => (
                <div key={item.title} className="vini-card">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="vini-card-img"
                  />
                  <div className="vini-card-body">
                    <h4 className="vini-card-title">{item.title}</h4>
                    <p className="vini-card-desc">{item.description}</p>
                    <div style={{ marginTop: 'auto' }}>
                      <span className="vini-card-price">
                        {item.price === 'Ver preço' ? 'Consultar via iFood' : `A partir de ${item.price}`}
                      </span>
                      <div className="vini-card-actions">
                        <a href={item.ifoodUrl} target="_blank" className="btn-ifood">
                          <ShoppingCart size={14} /> iFood
                        </a>
                        <a href={item.anotaaiUrl} target="_blank" className="btn-anota-ai">
                          <MessageSquare size={14} /> Anota Aí
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ textAlign: 'center', marginTop: '40px', color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>
          * Imagens meramente ilustrativas. Preços sujeitos a alteração sem aviso prévio.
        </div>
      </div>
    </section>
  );
}

export default Menu;
