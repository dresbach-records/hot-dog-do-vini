import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, Receipt, Users, Store, Settings, LogOut, Flame,
  ChevronDown, ChevronRight, Gift, Megaphone, FileText, Wallet, ArrowRightLeft, CalendarClock, History, ShieldCheck, Key, Lock, Bell,
  ClipboardList, UtensilsCrossed, Bike, UsersRound, BarChart3, CreditCard, Ticket, Link
} from 'lucide-react';
import './Sidebar.css';

function Sidebar({ onLogout }) {
  const [openSection, setOpenSection] = useState('delivery'); // 'delivery', 'automacao', 'erp', 'perf' or null

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
                  <NavLink to="/admin/pedidos" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <ClipboardList size={20} />
                    <span>Pedidos (Kanban)</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/cardapio" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <UtensilsCrossed size={20} />
                    <span>Cardápio Digital</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/motoboys" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Bike size={20} />
                    <span>Equipe Motoboys</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/clientes" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <UsersRound size={20} />
                    <span>Base de Clientes</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </div>

          <div className="nav-section">
            <h3 
              className="nav-section-title collapsible" 
              onClick={() => toggleSection('automacao')}
            >
              <span>Automação</span>
              {openSection === 'automacao' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </h3>
            {openSection === 'automacao' && (
              <ul className="submenu">
                <li>
                  <NavLink to="/admin/vini-bot" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Flame size={20} color="#EA1D2C" />
                    <span>Vini Bot (Whats)</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/impressao" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Receipt size={20} />
                    <span>Config. Impressora</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/auto-atendimento" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Store size={20} />
                    <span>Auto-atendimento</span>
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
                  <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard Geral</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/caixa" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <ShoppingBag size={20} />
                    <span>PDV & Caixa</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/rh" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Users size={20} />
                    <span>RH & Escala</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/filiais" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Store size={20} />
                    <span>Múltiplas Filiais</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </div>

          <div className="nav-section">
            <h3 
              className="nav-section-title collapsible" 
              onClick={() => toggleSection('financeiro')}
            >
              <span>Financeiro 360°</span>
              {openSection === 'financeiro' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </h3>
            {openSection === 'financeiro' && (
              <ul className="submenu">
                <li>
                  <NavLink to="/admin/financas-hub" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <BarChart3 size={20} color="var(--c-green)" />
                    <span>Dashboard Financeiro</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/cobrancas" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <CreditCard size={20} />
                    <span>Gestão de Cobranças</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/convenios" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Users size={20} />
                    <span>Saldo Compartilhado & Gestão</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/transferencias" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <ArrowRightLeft size={20} />
                    <span>Transferências</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/assinaturas" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <CalendarClock size={20} />
                    <span>Assinaturas Resgate</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/antecipacoes" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <History size={20} />
                    <span>Antecipações</span>
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
                  <NavLink to="/admin/fidelidade" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Gift size={20} />
                    <span>Fidelidade & Sorteios</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/cupons" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Ticket size={20} color="var(--c-yellow)" />
                    <span>Cupons (Promo Sex)</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/marketing" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Megaphone size={20} />
                    <span>Campanhas Whats</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/pagamentos" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <CreditCard size={20} />
                    <span>Pagamentos</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </div>

          <div className="nav-section">
            <h3 
              className="nav-section-title collapsible" 
              onClick={() => toggleSection('utilitarios')}
            >
              <span>Utilitários & Fiscal</span>
              {openSection === 'utilitarios' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </h3>
            {openSection === 'utilitarios' && (
              <ul className="submenu">
                <li>
                  <NavLink to="/admin/fiscal" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <FileText size={20} />
                    <span>Módulo Fiscal (NF-e)</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/kyc" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <ShieldCheck size={20} />
                    <span>Situação da Conta</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/api-keys" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Key size={20} />
                    <span>Chaves de API</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/notificacoes" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
                    <Bell size={20} />
                    <span>Notificações</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/integracoes" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
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
        <NavLink to="/admin/configuracoes" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
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
