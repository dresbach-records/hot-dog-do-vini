import { useState } from 'react';
import { Flame, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../styles/global/login.css';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('E-mail ou senha inválidos. Verifique suas credenciais.');
      setLoading(false);
    } else {
      onLogin(); // Notifica o App.jsx do sucesso
    }
  };

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card vini-glass-panel" style={{ position: 'relative' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ position: 'absolute', left: '20px', top: '20px', display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}
        >
          <ArrowLeft size={14} /> Voltar ao site
        </button>
        <div className="login-header" style={{ marginTop: '1.5rem' }}>
          <div className="logo-icon-login" style={{ background: 'transparent', boxShadow: 'none' }}>
            <img 
              src="/Logo Vini's estilo M.png" 
              alt="Vini's Logo" 
              style={{ width: '120px', height: 'auto', marginBottom: '1rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} 
            />
          </div>
          <h2>Área Administrativa</h2>
          <p>Faça login para gerenciar o Vini's ERP</p>
        </div>

        {error && (
          <div className="error-vini-badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.8rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', border: '1px solid #fca5a5' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email Corporativo</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                placeholder="vini@vinis.com.br" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Senha</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="form-actions">
            <label className="checkbox-label">
              <input type="checkbox" /> Manter conectado
            </label>
            <button type="button" className="forgot-password" style={{ background: 'none', border: 'none', color: 'var(--c-red)', cursor: 'pointer', padding: 0 }}>Esqueceu a senha?</button>
          </div>

          <button type="submit" className="vini-btn-primary login-btn" disabled={loading}>
            {loading ? 'Verificando...' : 'Acessar ERP'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
