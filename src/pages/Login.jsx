import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Loader2, Mail, Lock } from 'lucide-react';
import '../styles/global/login.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verifica se já está logado
  useEffect(() => {
    const token = localStorage.getItem('vinis_auth_token');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.success) {
        localStorage.setItem('vinis_auth_token', response.token);
        localStorage.setItem('vinis_user', JSON.stringify(response.user));
        
        // Dispara evento para o App.jsx
        window.dispatchEvent(new Event('auth_change'));
        
        navigate('/admin/dashboard');
      } else {
        setError(response.error || 'Falha na autenticação');
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card vini-glass-panel" style={{ position: 'relative', width: '100%', maxWidth: '450px', padding: '2.5rem' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            position: 'absolute', 
            left: '20px', 
            top: '20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px', 
            color: '#64748b', 
            fontSize: '0.8rem', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            fontWeight: '500',
            zIndex: 10
          }}
        >
          <ArrowLeft size={14} /> Voltar ao site
        </button>

        <div className="login-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img 
            src="/Logo Vini's estilo M.png" 
            alt="Vini's Logo" 
            style={{ width: '100px', height: 'auto', marginBottom: '1rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} 
          />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>Portal Admin Vini's</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Acesso restrito para gestão do ERP</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {error && (
            <div style={{ backgroundColor: 'rgba(234, 29, 44, 0.1)', border: '1px solid #ea1d2c', color: '#ea1d2c', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>E-mail Profissional</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="email" 
                placeholder="exemplo@vinis.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 15px 12px 40px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
                autoComplete="off"
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Sua Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input 
                type="password" 
                placeholder="Sua senha segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 15px 12px 40px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  outline: 'none'
                }}
                autoComplete="off"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              backgroundColor: '#ea1d2c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '0.5rem',
              transition: 'all 0.3s ease'
            }}
            className="vini-auth-button"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Acessar ERP do Vini'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a href="#" style={{ color: '#ea1d2c', textDecoration: 'none', fontSize: '0.8rem' }}>Esqueceu sua senha?</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
