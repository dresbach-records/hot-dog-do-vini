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
import Pagamentos from './pages/Pagamentos';
import Agendamentos from './pages/Agendamentos';
import ConveniosAdmin from './pages/ConveniosAdmin';

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

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-red)' }}>
      <h3>Carregando Vini's ERP...</h3>
    </div>
  );

  const isAdmin = session?.user?.user_metadata?.role !== 'cliente';

  return (
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
                    <Route path="/" element={<Navigate to="/admin/dashboard" />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/pedidos" element={<Pedidos />} />
                    <Route path="/agendamentos" element={<Agendamentos />} />
                    <Route path="/cardapio" element={<Cardapio />} />
                    <Route path="/entregas" element={<Entregas />} />
                    <Route path="/area-entrega" element={<AreaEntrega />} />
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/fidelidade" element={<Sorteios />} />
                    <Route path="/caixa" element={<Caixa />} />
                    <Route path="/despesas" element={<Financeiro />} />
                    <Route path="/rh" element={<RH />} />
                    <Route path="/filiais" element={<Filiais />} />
                    <Route path="/relatorios" element={<Relatorios />} />
                    <Route path="/marketing" element={<Marketing />} />
                    <Route path="/pagamentos" element={<Pagamentos />} />
                    <Route path="/convenios" element={<ConveniosAdmin />} />
                    <Route path="/integracoes" element={<Integracoes />} />
                    <Route path="/configuracoes" element={<Configuracoes />} />
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
  );
}

export default App;
