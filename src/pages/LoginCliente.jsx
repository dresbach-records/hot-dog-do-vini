import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClientes } from '../context/ClientesContext';

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
  const { adicionarCliente } = useClientes();

  useEffect(() => {
    // Verificar se viemos de um link de recuperação de senha
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('mode') === 'reset' || window.location.hash.includes('type=recovery')) {
      setMode('update-password');
      setSuccess('Conexão segura estabelecida. Digite sua nova senha abaixo.');
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (authError.message.includes('Email not confirmed')) {
        setError('Por favor, confirme seu e-mail antes de acessar. Verifique sua caixa de entrada.');
      } else if (authError.status === 400) {
        setError('E-mail ou senha incorretos. Tente novamente.');
      } else {
        setError(`Acesso negado: ${authError.message}`);
      }
      setLoading(false);
    } else {
      const searchParams = new URLSearchParams(location.search);
      const redirect = searchParams.get('redirectTo');
      navigate(redirect || '/cliente.vinis');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: nome,
          role: 'cliente'
        }
      }
    });

    if (authError) {
      console.error('Erro no Supabase Auth (Sign Up):', authError);
      
      // Personalizar mensagem para e-mail já cadastrado
      if (authError.message.includes('User already registered') || authError.status === 422) {
        setError('Ops, este e-mail já está cadastrado. Faça login ou recupere o acesso.');
      } else {
        setError(`Erro no cadastro: ${authError.message}`);
      }
      
      setLoading(false);
    } else {
      console.log('Auth realizado com sucesso:', data.user?.id);
      // Registrar no banco de dados public.clientes
      if (data.user) {
        try {
          const res = await adicionarCliente({
            nome: nome,
            id_auth: data.user.id,
            email: email
          });
          console.log('Registro na tabela clientes:', res);
        } catch (dbError) {
          console.error('Erro ao sincronizar com a tabela clientes:', dbError);
          // Nota: O usuário ainda foi criado no Auth, mas o perfil no DB falhou
        }
      }
      setSuccess('Cadastro realizado! Se o e-mail de confirmação estiver ativado no Supabase, verifique sua caixa de entrada.');
      setLoading(false);
    }
  };

  const handleRecovery = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login.vinis?mode=reset',
    });

    if (recoveryError) {
      setError(recoveryError.message);
    } else {
      setSuccess('Link de recuperação enviado para o seu e-mail.');
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess('Senha atualizada com sucesso! Você já pode entrar.');
      setTimeout(() => setMode('login'), 2000);
    }
    setLoading(false);
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
