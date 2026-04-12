import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Store, MapPin, Clock, Users, 
  Save, Check, AlertCircle, Info,
  Plus, Trash2, Shield, Camera
} from 'lucide-react';
import '../styles/admin/dashboard.css';

function Configuracoes() {
  const [activeTab, setActiveTab] = useState('perfil');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "Hot Dog do Vini",
    category: "Lanches",
    phone: "(48) 99999-9999",
    cep: "",
    address: "",
    number: "",
    bairro: "",
    city: "Florianópolis"
  });

  const [horarios, setHorarios] = useState({
    segunda: { aberto: true, inicio: '18:00', fim: '23:30' },
    terca: { aberto: true, inicio: '18:00', fim: '23:30' },
    quarta: { aberto: true, inicio: '18:00', fim: '23:30' },
    quinta: { aberto: true, inicio: '18:00', fim: '23:30' },
    sexta: { aberto: true, inicio: '18:00', fim: '01:00' },
    sabado: { aberto: true, inicio: '18:00', fim: '01:00' },
    domingo: { aberto: false, inicio: '--:--', fim: '--:--' }
  });

  const handleSave = async () => {
    setLoading(true);
    // Simulação de delay profissional
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="admin-page-container">
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
           <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Configurações</h1>
           <p style={{ opacity: 0.6 }}>Gerencie o funcionamento e a identidade da sua loja</p>
        </div>
        <div className="header-actions">
           <button 
             className="vini-btn-primary" 
             onClick={handleSave}
             disabled={loading}
             style={{ background: success ? '#27ae60' : '' }}
           >
              {loading ? 'Salvando...' : success ? <><Check size={18}/> Salvo</> : <><Save size={18}/> SALVAR ALTERAÇÕES</>}
           </button>
        </div>
      </header>

      {/* TABS iFood Style */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', marginBottom: '2rem' }}>
         <button onClick={() => setActiveTab('perfil')} style={{ padding: '15px 30px', border: 'none', background: 'none', fontWeight: 700, color: activeTab === 'perfil' ? '#ea1d2c' : '#888', borderBottom: activeTab === 'perfil' ? '3px solid #ea1d2c' : '3px solid transparent', cursor: 'pointer' }}>LOJA</button>
         <button onClick={() => setActiveTab('endereco')} style={{ padding: '15px 30px', border: 'none', background: 'none', fontWeight: 700, color: activeTab === 'endereco' ? '#ea1d2c' : '#888', borderBottom: activeTab === 'endereco' ? '3px solid #ea1d2c' : '3px solid transparent', cursor: 'pointer' }}>ENDEREÇO</button>
         <button onClick={() => setActiveTab('horarios')} style={{ padding: '15px 30px', border: 'none', background: 'none', fontWeight: 700, color: activeTab === 'horarios' ? '#ea1d2c' : '#888', borderBottom: activeTab === 'horarios' ? '3px solid #ea1d2c' : '3px solid transparent', cursor: 'pointer' }}>HORÁRIOS</button>
         <button onClick={() => setActiveTab('equipe')} style={{ padding: '15px 30px', border: 'none', background: 'none', fontWeight: 700, color: activeTab === 'equipe' ? '#ea1d2c' : '#888', borderBottom: activeTab === 'equipe' ? '3px solid #ea1d2c' : '3px solid transparent', cursor: 'pointer' }}>ACESSOS</button>
      </div>

      <div className="settings-content">
        
        {activeTab === 'perfil' && (
          <div className="vini-glass-panel" style={{ padding: '2rem', maxWidth: '800px' }}>
             <div style={{ display: 'flex', gap: '30px', marginBottom: '2rem' }}>
                <div style={{ position: 'relative' }}>
                   <div style={{ width: '120px', height: '120px', background: '#eee', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Store size={48} opacity={0.2}/>
                   </div>
                   <button style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#333', color: '#fff', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Camera size={18}/></button>
                </div>
                <div style={{ flex: 1 }}>
                   <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#666', marginBottom: '8px' }}>NOME DA LOJA</label>
                   <input className="vini-input" placeholder="Hamburgueria Exemplo" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#666', marginBottom: '8px' }}>CATEGORIA</label>
                  <select className="vini-input">
                     <option>Lanches</option>
                     <option>Pizza</option>
                     <option>Açaí</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#666', marginBottom: '8px' }}>TELEFONE PÚBLICO</label>
                  <input className="vini-input" placeholder="(00) 00000-0000" value={form.phone} />
                </div>
             </div>
          </div>
        )}

        {activeTab === 'endereco' && (
          <div className="vini-glass-panel" style={{ padding: '2rem', maxWidth: '800px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                   <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#666', marginBottom: '8px' }}>CEP</label>
                   <input className="vini-input" placeholder="00000-000" />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                   <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Buscando o endereço automaticamente...</p>
                </div>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                   <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#666', marginBottom: '8px' }}>RUA/LOGRADOURO</label>
                   <input className="vini-input" placeholder="Av. Principal" />
                </div>
                <div>
                   <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#666', marginBottom: '8px' }}>Nº</label>
                   <input className="vini-input" placeholder="123" />
                </div>
             </div>
             <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#666', marginBottom: '8px' }}>BAIRRO</label>
                <input className="vini-input" placeholder="Centro" />
             </div>
          </div>
        )}

        {activeTab === 'horarios' && (
          <div className="vini-glass-panel" style={{ padding: '2rem', maxWidth: '900px' }}>
             <div style={{ background: '#fcedda', color: '#f39c12', padding: '15px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                <Clock size={20}/>
                <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>O site e o robô de WhatsApp abrirão e fecharão automaticamente seguindo esta grade.</p>
             </div>

             <div className="horarios-grid">
                {Object.keys(horarios).map(dia => (
                  <div key={dia} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f2f2f2' }}>
                     <div style={{ width: '120px', fontWeight: 700, textTransform: 'capitalize' }}>{dia}</div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                           <input 
                             type="checkbox" 
                             checked={horarios[dia].aberto} 
                             onChange={e => setHorarios({...horarios, [dia]: {...horarios[dia], aberto: e.target.checked}})}
                           />
                           <span style={{ fontSize: '0.9rem' }}>{horarios[dia].aberto ? 'Aberto' : 'Fechado'}</span>
                        </label>
                        {horarios[dia].aberto && (
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input className="vini-input" style={{ width: '100px', height: '36px', padding: '5px' }} type="time" value={horarios[dia].inicio} />
                              <span>às</span>
                              <input className="vini-input" style={{ width: '100px', height: '36px', padding: '5px' }} type="time" value={horarios[dia].fim} />
                           </div>
                        )}
                     </div>
                     <button style={{ background: 'none', border: 'none', color: '#aaa' }}><Plus size={18}/></button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'equipe' && (
           <div className="vini-glass-panel" style={{ padding: '0' }}>
              <div style={{ padding: '2rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <h3 style={{ margin: 0 }}>Gestão de Time</h3>
                   <p style={{ margin: 0, opacity: 0.6, fontSize: '0.85rem' }}>Controle quem pode acessar o sistema e quais permissões possuem.</p>
                 </div>
                 <button className="vini-btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}><Plus size={16}/> NOVO USUÁRIO</button>
              </div>

              <div className="users-list">
                 {[1,2].map(u => (
                   <div key={u} style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                         <div style={{ width: '45px', height: '45px', background: '#333', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>V</div>
                         <div>
                            <strong style={{ display: 'block' }}>Vinicius {u === 1 ? '(Dono)' : 'Manager'}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}>vini@hotdog.com.br</span>
                         </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                         <span style={{ padding: '4px 12px', background: '#333', color: '#fff', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>{u === 1 ? 'ADMIN' : 'GERENTE'}</span>
                         <button style={{ background: 'none', border: 'none', color: '#666' }}><Shield size={18}/></button>
                         <button style={{ background: 'none', border: 'none', color: '#e74c3c' }}><Trash2 size={18}/></button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

      </div>
    </div>
  );
}

export default Configuracoes;
