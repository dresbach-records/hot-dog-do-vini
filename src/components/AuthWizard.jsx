import React, { useState } from 'react';
import api from '../services/api';
import { 
  User, Mail, Lock, Phone, MapPin, Calendar, 
  Building2, CheckCircle2, ArrowRight, ArrowLeft,
  Briefcase
} from 'lucide-react';

const companies = [
  "Cris du", "Usaflex", "Beira Rio", "Piccadilly", "Bottero", 
  "Milenar Shoes", "Faccine", "Quintin", "Zeket", "Vicenza", 
  "Geranya", "Laizzely", "Bella Vista"
];

const styles = {
  container: {
    maxWidth: '430px',
    margin: '0 auto',
    padding: '1.5rem',
    fontFamily: "'Inter', sans-serif",
  },
  stepIndicator: {
    display: 'flex',
    gap: '8px',
    marginBottom: '2rem',
  },
  dot: (active) => ({
    flex: 1,
    height: '4px',
    borderRadius: '4px',
    backgroundColor: active ? '#dc2626' : '#e2e8f0',
  }),
  card: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#64748b',
    marginBottom: '2rem',
  },
  inputGroup: {
    marginBottom: '1.2rem',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.8rem 1rem 0.8rem 2.8rem',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    outline: 'none',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
  },
  icon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
  },
  buttonPrimary: {
    width: '100%',
    padding: '1.1rem',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#dc2626',
    color: '#fff',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '2rem',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
  },
  buttonSecondary: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginTop: '1.5rem',
    width: '100%',
    justifyContent: 'center',
  }
};

export default function AuthWizard({ onFinished, onCancel }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    endereco: '',
    dataNascimento: '',
    email: '',
    telefone: '',
    password: '',
    empresa: '',
    trabalhaNaFabrica: false,
    ativarIntegracao: false
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    try {
      // Registrar no backend VPS
      // O backend já cuida da inserção na tabela 'clientes' se o papel for 'cliente'
      const response = await api.post('/auth/register', {
        email: formData.email,
        password: formData.password,
        name: formData.nome,
        role: 'cliente'
      });

      if (response.success) {
        // Agora fazemos o login automático ou apenas avançamos para o sucesso
        localStorage.setItem('vinis_auth_token', response.token);
        localStorage.setItem('vinis_user', JSON.stringify(response.user));
        window.dispatchEvent(new Event('auth_change'));
        
        setStep(5); // Passo de sucesso
      } else {
        setError(response.error || 'Falha no cadastro');
      }
    } catch (err) {
      setError(err.message || 'Erro de conexão ao servidor');
    } finally {
      setLoading(false);
    }
  };

  if (step === 5) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={64} color="#16a34a" style={{ margin: '0 auto 1.5rem' }} />
            <h2 style={styles.title}>Cadastro Finalizado!</h2>
            <p style={styles.subtitle}>
              {formData.ativarIntegracao 
                ? `A integração com a firma ${formData.empresa} estará disponível após a análise do gestor. Você receberá um e-mail em breve.`
                : 'Seu cadastro foi realizado com sucesso. Bem-vindo à família Vini\'s!'}
            </p>
            <button onClick={onFinished} style={styles.buttonPrimary}>
              Acessar Portal <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.stepIndicator}>
        {[1, 2, 3, 4].map(i => <div key={i} style={styles.dot(step >= i)} />)}
      </div>

      <div style={styles.card}>
        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={styles.title}>Quem é você?</h2>
            <p style={styles.subtitle}>Fase 1: Dados Pessoais</p>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nome Completo</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={styles.icon} />
                <input style={styles.input} type="text" placeholder="Como quer ser chamado?" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>CPF</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={styles.icon} />
                <input style={styles.input} type="text" placeholder="000.000.000-00" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Endereço Residencial</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={styles.icon} />
                <input style={styles.input} type="text" placeholder="Rua, Número, Bairro" value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Data de Nascimento</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={18} style={styles.icon} />
                <input style={styles.input} type="date" value={formData.dataNascimento} onChange={e => setFormData({...formData, dataNascimento: e.target.value})} />
              </div>
            </div>

            <button onClick={nextStep} style={styles.buttonPrimary} disabled={!formData.nome || !formData.cpf}>
              Continuar <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={styles.title}>Como acessar?</h2>
            <p style={styles.subtitle}>Fase 2: Sua Conta</p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={styles.icon} />
                <input style={styles.input} type="email" placeholder="seu@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>WhatsApp</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={styles.icon} />
                <input style={styles.input} type="text" placeholder="(DD) 9 0000-0000" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Senha Desejada</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={styles.icon} />
                <input style={styles.input} type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            <button onClick={nextStep} style={styles.buttonPrimary} disabled={!formData.email || !formData.password}>
              Continuar <ArrowRight size={18} />
            </button>
            <button onClick={prevStep} style={styles.buttonSecondary}><ArrowLeft size={16} /> Voltar</button>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={styles.title}>Vínculo</h2>
            <p style={styles.subtitle}>Você trabalha em alguma dessas fábricas?</p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Selecione sua Empresa/Fábrica</label>
              <div style={{ position: 'relative' }}>
                <Building2 size={18} style={styles.icon} />
                <select 
                  style={{ ...styles.input, appearance: 'none', cursor: 'pointer' }} 
                  value={formData.empresa} 
                  onChange={e => setFormData({...formData, empresa: e.target.value, trabalhaNaFabrica: e.target.value !== ''})}
                >
                  <option value="">Não trabalho em fábrica parceira</option>
                  {companies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {formData.empresa && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Setor / Função</label>
                <div style={{ position: 'relative' }}>
                   <Briefcase size={18} style={styles.icon} />
                   <input style={styles.input} type="text" placeholder="Ex: Produção, Admin..." value={formData.setor} onChange={e => setFormData({...formData, setor: e.target.value})} />
                </div>
              </div>
            )}

            <button onClick={nextStep} style={styles.buttonPrimary}>
              Continuar <ArrowRight size={18} />
            </button>
            <button onClick={prevStep} style={styles.buttonSecondary}><ArrowLeft size={16} /> Voltar</button>
          </div>
        )}

        {step === 4 && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={styles.title}>Ativar Integração?</h2>
            <p style={styles.subtitle}>Com a integração, você pode agendar lanches e pagar direto na folha/agendamento.</p>

            <div style={{ 
              padding: '1.2rem', 
              borderRadius: '12px', 
              border: formData.ativarIntegracao ? '2px solid #dc2626' : '1px solid #e2e8f0', 
              backgroundColor: formData.ativarIntegracao ? '#fef2f2' : '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }} onClick={() => setFormData({...formData, ativarIntegracao: true})}>
              <CheckCircle2 color={formData.ativarIntegracao ? '#dc2626' : '#cbd5e1'} />
              <div>
                <div style={{ fontWeight: '700', color: '#1e293b' }}>Sim, desejo ativar</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Requer aprovação do gestor da {formData.empresa || 'fábrica'}</div>
              </div>
            </div>

            <div style={{ 
              padding: '1.2rem', 
              borderRadius: '12px', 
              border: !formData.ativarIntegracao ? '2px solid #dc2626' : '1px solid #e2e8f0', 
              backgroundColor: !formData.ativarIntegracao ? '#fef2f2' : '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }} onClick={() => setFormData({...formData, ativarIntegracao: false})}>
              <CheckCircle2 color={!formData.ativarIntegracao ? '#dc2626' : '#cbd5e1'} />
              <div>
                <div style={{ fontWeight: '700', color: '#1e293b' }}>Não, apenas balcão/delivery</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Pagamento via Pix ou Cartão na hora</div>
              </div>
            </div>

            {error && <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center' }}>{error}</div>}

            <button onClick={handleSignUp} disabled={loading} style={styles.buttonPrimary}>
              {loading ? 'Processando...' : 'Finalizar Cadastro'} <ArrowRight size={18} />
            </button>
            <button onClick={prevStep} style={styles.buttonSecondary}><ArrowLeft size={16} /> Voltar</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

