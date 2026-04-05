import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Receipt, Users, Store, Settings, LogOut, Flame,
  ClipboardList, UtensilsCrossed, Bike, MapPin, BarChart3, UsersRound, Ticket, Link, CreditCard,
  ChevronDown, ChevronRight, Gift
} from 'lucide-react';
import './Sidebar.css';

function Sidebar({ onLogout }) {
  const [openSection, setOpenSection] = useState(null); // 'delivery', 'erp', 'perf' or null

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <aside className="sidebar vini-glass-panel">
      <div className="sidebar-header" style={{ padding: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
        <div className="logo-container" style={{ background: 'transparent', textAlign: 'center', width: '100%' }}>
          <img 
            src="/Logo Vini's estilo M.png" 
            alt="Vini's Logo" 
            style={{ width: '87%', maxWidth: '200px', maxHeight: '110px', height: 'auto', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))', objectFit: 'contain' }} 
          />
        </div>
      </div>

      <div className="sidebar-scrollable-area">
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 
              className="nav-section-title collapsible" 
              onClick={() => toggleSection('delivery')}
            >
              <span>Delivery</span>
              {openSection === 'delivery' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </h3>
            {openSection === 'delivery' && (
              <ul className="submenu">
                <li>
                  <NavLink to="/pedidos" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <ClipboardList size={20} />
                    <span>Pedidos</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/cardapio" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <UtensilsCrossed size={20} />
                    <span>Cardápio</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/entregas" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Bike size={20} />
                    <span>Entregas</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/area-entrega" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <MapPin size={20} />
                    <span>Área de Entrega</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/clientes" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <UsersRound size={20} />
                    <span>Clientes</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </div>

          <div className="nav-section">
            <h3 
              className="nav-section-title collapsible" 
              onClick={() => toggleSection('erp')}
            >
              <span>Gestão ERP</span>
              {openSection === 'erp' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </h3>
            {openSection === 'erp' && (
              <ul className="submenu">
                <li>
                  <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard Geral</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/caixa" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <ShoppingBag size={20} />
                    <span>PDV & Caixa</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/despesas" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Receipt size={20} />
                    <span>Finanças & Insumos</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/rh" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Users size={20} />
                    <span>RH & Escala</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/filiais" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Store size={20} />
                    <span>Múltiplas Filiais</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/relatorios" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <BarChart3 size={20} />
                    <span>Dados & BI</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </div>

          <div className="nav-section">
            <h3 
              className="nav-section-title collapsible" 
              onClick={() => toggleSection('perf')}
            >
              <span>Performance</span>
              {openSection === 'perf' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </h3>
            {openSection === 'perf' && (
              <ul className="submenu">
                <li>
                  <NavLink to="/fidelidade" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Gift size={20} />
                    <span>Fidelidade & Sorteios</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/marketing" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Ticket size={20} />
                    <span>Marketing</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/pagamentos" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <CreditCard size={20} />
                    <span>Pagamentos</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/integracoes" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Link size={20} />
                    <span>Integrações</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </div>
        </nav>
      </div>

      <div className="sidebar-footer">
        <NavLink to="/configuracoes" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <Settings size={20} />
          <span>Configurações</span>
        </NavLink>
        <button className="nav-item logout" onClick={onLogout}>
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
