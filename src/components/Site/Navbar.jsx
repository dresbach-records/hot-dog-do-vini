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
          {/* Status da Loja */}
          <div className={`vini-status-badge ${isOpen ? 'open' : 'closed'}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', backgroundColor: isOpen ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: isOpen ? '#22c55e' : '#ef4444', border: `1px solid ${isOpen ? '#22c55e40' : '#ef444440'}` }}>
            <Circle size={8} fill="currentColor" stroke="none" />
            {isOpen ? 'ABERTO AGORA' : 'FECHADO'}
          </div>

          <Link to="/login.vinis" className="nav-item-clean">
             <User size={18} /> CLIENTE
          </Link>
          <a href="#cardapio" className="nav-item-clean">
             <MenuSquare size={18} /> Cardápio
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
