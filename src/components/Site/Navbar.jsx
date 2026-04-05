import { User, MenuSquare, Utensils, Circle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const Navbar = () => {
  const { publicNotice } = useSettings();
  const isOpen = publicNotice?.salesEnabled;

  return (
    <nav className="nav-clean">
      <div className="ni">
        <a href="#" className="nl">
          <img src="/Logo-VINI.png" alt="Hot Dog do Vini" className="nav-logo-img" />
        </a>
        
        <div className="nav-right-links">
          {/* Status da Loja com Pulso */}
          <div className={`vini-status-badge ${isOpen ? 'open' : 'closed'}`} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 16px', 
            borderRadius: '20px', 
            fontSize: '0.8rem', 
            fontWeight: '800', 
            backgroundColor: isOpen ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
            color: isOpen ? '#22c55e' : '#ef4444', 
            border: `1px solid ${isOpen ? '#22c55e40' : '#ef444440'}`,
            transition: 'all 0.3s ease'
          }}>
            <Circle size={10} fill="currentColor" stroke="none" className={isOpen ? 'vini-pulse' : ''} />
            {isOpen ? 'ABERTO AGORA' : 'FECHADO'}
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <Link to="/login.vinis" className="nav-item-clean" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', textDecoration: 'none', color: 'inherit' }}>
               <User size={20} /> CLIENTE
            </Link>
            <a href="#cardapio" className="nav-item-clean" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', textDecoration: 'none', color: 'inherit' }}>
               <MenuSquare size={20} /> Cardápio
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
