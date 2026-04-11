import { useState, useEffect } from 'react';
import api from '../services/api';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

function LoginCliente() {
  const [mode, setMode] = useState('login'); // login | signup | recover | update-password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verifica se já está logado
    const token = localStorage.getItem('vinis_auth_token');
    if (token) {
      const user = JSON.parse(localStorage.getItem('vinis_user') || '{}');
      if (user.role === 'cliente') {
        navigate('/cliente.vinis');
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.success) {
        localStorage.setItem('vinis_auth_token', response.token);
        localStorage.setItem('vinis_user', JSON.stringify(response.user));
        
        // Dispara evento para o App.jsx
        window.dispatchEvent(new Event('auth_change'));
        
        const searchParams = new URLSearchParams(location.search);
        const redirect = searchParams.get('redirectTo');
        navigate(redirect || '/cliente.vinis');
      } else {
        setError(response.error || 'E-mail ou senha incorretos.');
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/register', {
        name: nome,
        email,
        password,
        role: 'cliente'
      });

      if (response.success) {
        setSuccess('Cadastro realizado com sucesso! Você já pode entrar.');
        setMode('login');
      } else {
        setError(response.error || 'Erro ao realizar cadastro.');
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    setLoading(false);
    setError('Recuperação de senha desativada temporariamente. Entre em contato com o suporte.');
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(false);
    setError('Funcionalidade indisponível.');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
        
        <button 
          onClick={() => navigate('/')} 
          style={{ position: 'absolute', left: '20px', top: '20px', display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
        >
          <ArrowLeft size={14} /> Voltar ao site
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem', marginTop: '1.5rem' }}>
          <img src="/Logo Vini's estilo M.png" alt="Logo" style={{ width: '80px', marginBottom: '1rem' }} />
          <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '0.5rem' }}>
            {mode === 'login' ? 'Portal do Cliente' : mode === 'signup' ? 'Crie sua Conta' : mode === 'recover' ? 'Recuperar Acesso' : 'Nova Senha'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {mode === 'login' ? 'Acompanhe seus pedidos e fidelidade' : mode === 'signup' ? 'Faça parte da família Vini\'s' : mode === 'recover' ? 'Enviaremos um link no seu e-mail' : 'Digite sua nova senha abaixo'}
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <CheckCircle2 size={18} /> {success}
          </div>
        )}

        <form onSubmit={
          mode === 'login' ? handleLogin : 
          mode === 'signup' ? handleSignUp : 
          mode === 'recover' ? handleRecovery : 
          handleUpdatePassword
        }>
          {/* Dummy fields to trick browser autofill */}
          <input type="text" name="vini_dummy_customer" style={{ display: 'none' }} aria-hidden="true" />
          <input type="password" name="vini_dummy_customer_pass" style={{ display: 'none' }} aria-hidden="true" />

          {mode === 'signup' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#475569', marginBottom: '0.4rem' }}>Nome Completo</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome" 
                  required 
                  style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
                  autoComplete="off"
                  name="vini_customer_name"
                />
              </div>
            </div>
          )}

          {mode !== 'update-password' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#475569', marginBottom: '0.4rem' }}>E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" 
                  required 
                  style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
                  autoComplete="off"
                  name="vini_customer_email"
                />
              </div>
            </div>
          )}

          {(mode !== 'recover' && mode !== 'signup') && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#475569', marginBottom: '0.4rem' }}>
                {mode === 'update-password' ? 'Nova Senha' : 'Senha'}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
                  autoComplete="new-password"
                  name="vini_customer_pass"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
             <div style={{ marginBottom: '1.5rem' }}>
             <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#475569', marginBottom: '0.4rem' }}>Senha</label>
             <div style={{ position: 'relative' }}>
               <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
               <input 
                 type="password" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 placeholder="••••••••" 
                 required 
                 style={{ width: '100%', padding: '0.8rem 0.8rem 0.8rem 2.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
                 autoComplete="new-password"
                 name="vini_customer_signup_pass"
               />
             </div>
           </div>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {loading ? 'Processando...' : mode === 'login' ? 'Entrar Agora' : mode === 'signup' ? 'Criar Conta' : mode === 'recover' ? 'Enviar Link' : 'Salvar Nova Senha'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
          {mode === 'login' ? (
            <>
              Não tem conta? <button onClick={() => setMode('signup')} style={{ color: '#dc2626', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Cadastre-se</button>
              <br />
              <button onClick={() => setMode('recover')} style={{ marginTop: '0.5rem', color: '#64748b', background: 'none', border: 'none', fontSize: '0.8rem', cursor: 'pointer' }}>Esqueci minha senha</button>
            </>
          ) : mode === 'update-password' ? (
            <button onClick={() => setMode('login')} style={{ color: '#dc2626', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Ir para o Login</button>
          ) : (
            <button onClick={() => setMode('login')} style={{ color: '#dc2626', background: 'none', border: 'none', fontWeight: '600', cursor: 'pointer' }}>Voltar para o Login</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginCliente;
