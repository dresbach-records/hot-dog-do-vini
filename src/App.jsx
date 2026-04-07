import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Financeiro from './pages/Financeiro';
import Caixa from './pages/Caixa';
import RH from './pages/RH';
import Filiais from './pages/Filiais';
import Configuracoes from './pages/Configuracoes';
import Login from './pages/Login';
import LoginCliente from './pages/LoginCliente';
import Home from './pages/Home';

// Import Admin Layout Styles
import './styles/admin/layout.css';
// Novos módulos Delivery
import Pedidos from './pages/Pedidos';
import Cardapio from './pages/Cardapio';
import Entregas from './pages/Entregas';
import AreaEntrega from './pages/AreaEntrega';
import Clientes from './pages/Clientes';
import Relatorios from './pages/Relatorios';
import Sorteios from './pages/Sorteios';
import Marketing from './pages/Marketing';
import Integracoes from './pages/Integracoes';
import ConveniosAdmin from './pages/ConveniosAdmin';
import FechamentoCaixa from './pages/FechamentoCaixa';
import ViniBot from './pages/ViniBot';
import Impressao from './pages/Impressao';
import Motoboys from './pages/Motoboys';
import Fiscal from './pages/Fiscal';
import PDVBalcao from './pages/PDVBalcao';
import Estoque from './pages/Estoque';

// Novos Módulos Financeiros ERP
import FinancasHub from './pages/FinancasHub';
import Cobrancas from './pages/Cobrancas';
import Assinaturas from './pages/Assinaturas';
import Antecipacoes from './pages/Antecipacoes';
import Transferencias from './pages/Transferencias';
import KYCStatus from './pages/KYCStatus';
import APIKeys from './pages/APIKeys';
import Notificacoes from './pages/Notificacoes';

// Portal do Consumidor Final (Rota Externa Pública)
import PortalCliente from './pages/PortalCliente';
import ConveniosFlow from './pages/ConveniosFlow';
import Checkout from './pages/Checkout';

// Portal Components
import MeusPedidos from './pages/Portal/MeusPedidos';
import Perfil from './pages/Portal/Perfil';
import Fidelidade from './pages/Portal/Fidelidade';
import Cupons from './pages/Portal/Cupons';
import Ajuda from './pages/Portal/Ajuda';

// Contexto Global
import { ClientesProvider } from './context/ClientesContext';
import { SettingsProvider } from './context/SettingsContext';

import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Pegar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Bloqueio de PrintScreen (Aviso no console e redução de opacidade)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log("Proteção de Conteúdo Ativada!");
      }
    };

    // Bloqueio de Atalhos e Teclas de Cópia
    const handleKeyDown = (e) => {
      // Bloqueia F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, Ctrl+C, Ctrl+P
      if (
        e.keyCode === 123 || 
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
        (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 83 || e.keyCode === 67 || e.keyCode === 80))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Bloqueio de Clique Direito
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-red)' }}>
      <h3>Carregando Vini's ERP...</h3>
    </div>
  );

  const isAdmin = session && session.user?.user_metadata?.role !== 'cliente';

  return (
    <SettingsProvider>
      <ClientesProvider>
      <Router>
        <Routes>
          {/* == LANDING PAGE PÚBLICA (RAIZ) == */}
          <Route path="/" element={<Home />} />

          {/* == LOGIN PORTAL DO CLIENTE == */}
          <Route path="/login.vinis" element={session && !isAdmin ? <Navigate to="/cliente.vinis" /> : <LoginCliente />} />
          
          {/* == PORTAL DO CLIENTE (PROTEGIDO) == */}
          <Route path="/cliente.vinis" element={
            session && !isAdmin ? <PortalCliente session={session} /> : <Navigate to="/login.vinis" />
          } />

          <Route path="/convenios" element={
            session && !isAdmin ? <ConveniosFlow session={session} /> : <Navigate to="/login.vinis" />
          } />

          <Route path="/checkout" element={
            session && !isAdmin ? <Checkout session={session} /> : <Navigate to="/login.vinis" />
          } />

          <Route path="/cliente/pedidos" element={
            session && !isAdmin ? <MeusPedidos session={session} /> : <Navigate to="/login.vinis" />
          } />
          
          <Route path="/cliente/perfil" element={
            session && !isAdmin ? <Perfil session={session} /> : <Navigate to="/login.vinis" />
          } />

          <Route path="/cliente/fidelidade" element={
            session && !isAdmin ? <Fidelidade session={session} /> : <Navigate to="/login.vinis" />
          } />

          <Route path="/cliente/cupons" element={
            session && !isAdmin ? <Cupons session={session} /> : <Navigate to="/login.vinis" />
          } />

          <Route path="/cliente/ajuda" element={
            session && !isAdmin ? <Ajuda session={session} /> : <Navigate to="/login.vinis" />
          } />

          {/* == LOGIN ADMIN ERP == */}
          <Route path="/login" element={session && isAdmin ? <Navigate to="/admin/dashboard" /> : <Login onLogin={() => {}} />} />

          {/* == ÁREA ADMINISTRATIVA ERP (PROTEGIDA) == */}
          <Route path="/admin/*" element={
            session && isAdmin ? (
              <div className="app-container admin-container">
                <Sidebar onLogout={() => supabase.auth.signOut()} />
                <main className="main-content">
                  <Routes>
                    <Route path="" element={<Navigate to="/admin/dashboard" />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="pedidos" element={<Pedidos />} />
                    <Route path="cardapio" element={<Cardapio />} />
                    <Route path="cardapio" element={<Cardapio />} />
                    <Route path="entregas" element={<Entregas />} />
                    <Route path="area-entrega" element={<AreaEntrega />} />
                    <Route path="clientes" element={<Clientes />} />
                    <Route path="fidelidade" element={<Sorteios />} />
                    <Route path="caixa" element={<Caixa />} />
                    <Route path="fechamento-caixa" element={<FechamentoCaixa />} />
                    <Route path="vini-bot" element={<ViniBot />} />
                    <Route path="impressao" element={<Impressao />} />
                    <Route path="despesas" element={<Financeiro />} />
                    <Route path="rh" element={<RH />} />
                    <Route path="filiais" element={<Filiais />} />
                    <Route path="relatorios" element={<Relatorios />} />
                    <Route path="marketing" element={<Marketing />} />
                    <Route path="convenios" element={<ConveniosAdmin />} />
                    <Route path="convenios" element={<ConveniosAdmin />} />
                    <Route path="integracoes" element={<Integracoes />} />
                    <Route path="configuracoes" element={<Configuracoes />} />
                    <Route path="motoboys" element={<Motoboys />} />
                    <Route path="fiscal" element={<Fiscal />} />
                    <Route path="pdv-balcao" element={<PDVBalcao />} />
                    <Route path="estoque" element={<Estoque />} />
                    <Route path="cupons" element={<Cupons />} />
                    <Route path="pagamentos" element={<Cobrancas />} />
                    
                    {/* Financeiro 360° Routes */}
                    <Route path="financas-hub" element={<FinancasHub />} />
                    <Route path="cobrancas" element={<Cobrancas />} />
                    <Route path="transferencias" element={<Transferencias />} />
                    <Route path="assinaturas" element={<Assinaturas />} />
                    <Route path="antecipacoes" element={<Antecipacoes />} />
                    <Route path="kyc" element={<KYCStatus />} />
                    <Route path="api-keys" element={<APIKeys />} />
                    <Route path="notificacoes" element={<Notificacoes />} />

                    <Route path="*" element={<Navigate to="/admin/dashboard" />} />
                  </Routes>
                </main>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          } />

          {/* Catch-all for Root level */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ClientesProvider>
    </SettingsProvider>
  );
}

export default App;
