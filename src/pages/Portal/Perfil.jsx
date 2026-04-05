import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  Save, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const Perfil = ({ session }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    endereco: {
      rua: '',
      numero: '',
      bairro: '',
      cidade: 'Taquara/RS',
      complemento: ''
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return;
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('codigo_vini', session.user.id)
        .single();

      if (!error && data) {
        setFormData({
          nome: data.nome || '',
          email: data.email || '',
          telefone: data.telefone || '',
          cpf: data.cpf || '',
          endereco: data.endereco_padrao || formData.endereco
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [session]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    
    setSaving(true);
    setSuccess(false);

    try {
      // Limpeza básica dos dados
      const payload = {
        nome: formData.nome.trim(),
        telefone: formData.telefone.trim(),
        cpf: formData.cpf.trim().replace(/\D/g, ''), // Salva apenas números
        endereco_padrao: {
          ...formData.endereco,
          updated_at: new Date().toISOString()
        }
      };

      const { data, error } = await supabase
        .from('clientes')
        .update(payload)
        .eq('codigo_vini', session.user.id)
        .select();

      if (error) throw error;

      if (data) {
        setSuccess(true);
        // Atualiza localmente para feedback imediato
        localStorage.setItem('vini_perfil_cache', JSON.stringify(payload));
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Erro detalhado ao salvar perfil:", err);
      alert(`Erro: ${err.message || 'Verifique sua conexão e tente novamente.'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="vini-perfil-loading">Carregando perfil...</div>;

  return (
    <div className="vini-perfil-container">
      <header className="vini-perfil-header">
        <button onClick={() => window.history.back()} className="vini-back-btn">
          <ArrowLeft size={24} />
        </button>
        <h1 className="vini-perfil-title">Meus Dados</h1>
      </header>

      <main className="vini-perfil-content">
        <form onSubmit={handleSave} className="vini-perfil-form">
          <div className="vini-perfil-section">
            <h3 className="vini-section-title">Informações Pessoais</h3>
            <div className="vini-input-group">
              <label><User size={16} /> Nome Completo</label>
              <input 
                type="text" 
                value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
                required
              />
            </div>
            <div className="vini-input-row">
              <div className="vini-input-group">
                <label><Phone size={16} /> Telefone</label>
                <input 
                  type="text" 
                  value={formData.telefone}
                  onChange={e => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="vini-input-group">
                <label><CreditCard size={16} /> CPF</label>
                <input 
                  type="text" 
                  value={formData.cpf}
                  onChange={e => setFormData({...formData, cpf: e.target.value})}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
          </div>

          <div className="vini-perfil-section">
            <h3 className="vini-section-title">Endereço de Entrega Padrão</h3>
            <div className="vini-input-group">
              <label><MapPin size={16} /> Rua / Avenida</label>
              <input 
                type="text" 
                value={formData.endereco.rua}
                onChange={e => setFormData({...formData, endereco: {...formData.endereco, rua: e.target.value}})}
              />
            </div>
            <div className="vini-input-row">
              <div className="vini-input-group">
                <label>Número</label>
                <input 
                  type="text" 
                  value={formData.endereco.numero}
                  onChange={e => setFormData({...formData, endereco: {...formData.endereco, numero: e.target.value}})}
                />
              </div>
              <div className="vini-input-group">
                <label>Bairro</label>
                <input 
                  type="text" 
                  value={formData.endereco.bairro}
                  onChange={e => setFormData({...formData, endereco: {...formData.endereco, bairro: e.target.value}})}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="vini-btn-save" disabled={saving}>
            {saving ? 'Salvando...' : success ? <><CheckCircle2 size={18} /> Salvo com Sucesso</> : <><Save size={18} /> Salvar Alterações</>}
          </button>
        </form>
      </main>

      <style jsx>{`
        .vini-perfil-container { min-height: 100vh; background: #fff; }
        .vini-perfil-header { background: #fff; padding: 20px; display: flex; align-items: center; gap: 20px; border-bottom: 1px solid #f0f0f0; }
        .vini-perfil-title { margin: 0; font-size: 20px; font-weight: 800; }
        
        .vini-perfil-content { max-width: 600px; margin: 0 auto; padding: 30px 20px; }
        .vini-perfil-section { margin-bottom: 40px; }
        .vini-section-title { font-size: 16px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
        
        .vini-input-group { margin-bottom: 20px; flex: 1; }
        .vini-input-group label { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #333; }
        .vini-input-group input { width: 100%; border: 2px solid #f0f0f0; padding: 12px 15px; border-radius: 12px; font-size: 15px; transition: border-color 0.2s; }
        .vini-input-group input:focus { outline: none; border-color: var(--p-red, #EA1D2C); background: #fef2f220; }
        
        .vini-input-row { display: flex; gap: 20px; }
        @media (max-width: 480px) { .vini-input-row { flex-direction: column; gap: 0; } }
        
        .vini-btn-save { width: 100%; background: var(--p-red, #EA1D2C); color: #fff; border: none; padding: 18px; border-radius: 16px; font-size: 16px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: transform 0.2s; }
        .vini-btn-save:hover { transform: scale(1.02); }
        .vini-btn-save:disabled { background: #22C55E; cursor: default; }
      `}</style>
    </div>
  );
};

export default Perfil;
