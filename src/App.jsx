import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './services/api';
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
import Juridico from './pages/Juridico';

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
import { CaixaProvider } from './context/CaixaContext';

import './App.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const token = localStorage.getItem('vinis_auth_token');

    if (!token) {
      setSession(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.success) {
        setSession({
          user: response.user,
          access_token: token
        });
      } else {
        localStorage.removeItem('vinis_auth_token');
        setSession(null);
      }
    } catch (err) {
      console.error('[App Auth] Erro ao validar sessão', err);
      localStorage.removeItem('vinis_auth_token');
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('auth_change', handleAuthChange);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log("Proteção de Conteúdo Ativada!");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Bloqueios de F12 e clique direito removidos para facilitar Manutenção e Debugging.

    return () => {
      window.removeEventListener('auth_change', handleAuthChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a', color: 'var(--c-red)' }}>
      <h3>Carregando Vini's Cloud...</h3>
    </div>
  );

  // Detecção de Subdomínio para Roteamento Inteligente
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  // Detecção Robusta: Funciona mesmo com www.erp... ou apenas erp...
  const isERP = hostname.includes('erp.') || pathname.startsWith('/admin') || pathname.startsWith('/login');
  const isCliente = hostname.includes('cliente.') || pathname.startsWith('/cliente.') || pathname.startsWith('/login.vinis');

  const isAdmin = session && session.user?.role !== 'cliente';

  return (
    <SettingsProvider>
      <ClientesProvider>
        <CaixaProvider>
          <Router>
            <Routes>
              {/* == LÓGICA DE SUBDOMÍNIO (ROOT REDIRECTS) == */}
              {/* == LÓGICA DE SUBDOMÍNIO (ROOT REDIRECTS) == */}
              <Route path="/" element={
                isERP ? (session ? (isAdmin ? <Navigate to="/admin/dashboard" /> : <Navigate to="/cliente.vinis" />) : <Navigate to="/login" />) :
                  isCliente ? (session ? (!isAdmin ? <Navigate to="/cliente.vinis" /> : <Navigate to="/admin/dashboard" />) : <Navigate to="/login.vinis" />) :
                    <Home />
              } />

              {/* == LANDING PAGE PÚBLICA == */}
              {/* Já tratada acima no root / */}

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
              <Route path="/login" element={session && isAdmin ? <Navigate to="/admin/dashboard" /> : <Login onLogin={() => { }} />} />

              {/* == ÁREA ADMINISTRATIVA CLOUD (PROTEGIDA) == */}
              <Route path="/admin/*" element={
                session && isAdmin ? (
                  <div className="app-container admin-container">
                    <Sidebar user={session.user} onLogout={() => {
                      localStorage.removeItem('vinis_auth_token');
                      setSession(null);
                    }} />
                    <main className="main-content">
                      <Routes>
                        <Route path="" element={<Navigate to="/admin/dashboard" />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="pedidos" element={<Pedidos />} />
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
                        <Route path="integracoes" element={<Integracoes />} />
                        <Route path="configuracoes" element={<Configuracoes />} />
                        <Route path="motoboys" element={<Motoboys />} />
                        <Route path="fiscal" element={<Fiscal />} />
                        <Route path="pdv-balcao" element={<PDVBalcao />} />
                        <Route path="estoque" element={<Estoque />} />
                        <Route path="cupons" element={<Cupons />} />
                        <Route path="pagamentos" element={<Cobrancas />} />
                        <Route path="juridico" element={<Juridico />} />

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
        </CaixaProvider>
      </ClientesProvider>
    </SettingsProvider>
  );
}

export default App;
