import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft } from 'lucide-react';
import '../styles/global/login.css';

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/admin/dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="login-container animate-fade-in">
      <div className="login-card vini-glass-panel" style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>
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

        <div className="login-header" style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <img 
            src="/Logo Vini's estilo M.png" 
            alt="Vini's Logo" 
            style={{ width: '120px', height: 'auto', marginBottom: '1rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))' }} 
          />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>Portal Admin Vini's</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Acesso restrito para gestão do ERP</p>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#ea1d2c',
                    brandAccent: '#b91c1c',
                    inputBackground: 'rgba(255,255,255,0.05)',
                    inputText: 'white',
                    inputPlaceholder: 'rgba(255,255,255,0.3)',
                    inputBorder: 'rgba(255,255,255,0.1)',
                  },
                },
              },
              className: {
                container: 'vini-auth-container',
                button: 'vini-auth-button',
                input: 'vini-auth-input',
              }
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'E-mail Profissional',
                  password_label: 'Sua Senha',
                  button_label: 'Acessar ERP do Vini',
                  loading_button_label: 'Autenticando...',
                  email_input_placeholder: 'exemplo@vinis.com.br',
                  password_input_placeholder: 'Sua senha segura',
                },
              },
            }}
            providers={[]} // Pode-se adicionar ['google', 'github'] no futuro
          />
        </div>
      </div>

      <style>{`
        .vini-auth-container .supabase-auth-ui_ui-button {
          background-color: #ea1d2c !important;
          border-radius: 8px !important;
          font-weight: 700 !important;
          height: 48px !important;
          transition: all 0.3s ease !important;
        }
        .vini-auth-container .supabase-auth-ui_ui-button:hover {
          background-color: #b91c1c !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(234, 29, 44, 0.3);
        }
        .vini-auth-container .supabase-auth-ui_ui-input {
          background-color: rgba(0,0,0,0.2) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 8px !important;
          color: white !important;
          padding: 12px 15px !important;
        }
        .vini-auth-container .supabase-auth-ui_ui-label {
          color: #94a3b8 !important;
          font-size: 0.85rem !important;
          margin-bottom: 8px !important;
        }
        .vini-auth-container a {
          color: #ea1d2c !important;
          text-decoration: none !important;
          font-size: 0.8rem !important;
        }
      `}</style>
    </div>
  );
}

export default Login;
