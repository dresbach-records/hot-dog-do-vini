import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Bike, 
  Plus, 
  Phone, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  X,
  CreditCard,
  User,
  Search
} from 'lucide-react';

function Motoboys() {
  const [motoboys, setMotoboys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoy, setNewBoy] = useState({ nome: '', telefone: '', veiculo: 'Moto', status: 'disponivel', tipo: 'freelancer' });

  const fetchMotoboys = async () => {
    setLoading(true);
    try {
      const res = await api.get('/motoboys');
      if (res.success) {
        setMotoboys(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching motoboys', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotoboys();
  }, []);

  const handleAdd = async () => {
    try {
      const res = await api.post('/motoboys', newBoy);
      if (res.success) {
        setIsModalOpen(false);
        setNewBoy({ nome: '', telefone: '', veiculo: 'Moto', status: 'disponivel', tipo: 'freelancer' });
        fetchMotoboys();
      }
    } catch (err) {
      alert('Erro ao cadastrar motoboy');
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Excluir entregador?')) return;
    try {
      const res = await api.delete(`/motoboys/${id}`);
      if (res.success) fetchMotoboys();
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/motoboys/${id}/status`, { status });
      fetchMotoboys();
    } catch (err) {
      console.error('Status error', err);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Equipe de Motoboys 🛵</h2>
          <p>Gerencie seus entregadores e acompanhe as diárias em tempo real.</p>
        </div>
        <button className="btn vini-btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Cadastrar Entregador
        </button>
      </header>

      <div className="dashboard-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {motoboys.map(boy => (
            <div key={boy.id} className="vini-glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ background: boy.tipo === 'ifood' ? 'rgba(234, 29, 44, 0.1)' : 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px', border: boy.tipo === 'ifood' ? '1px solid var(--c-red)' : 'none' }}>
                  <Bike size={24} color={boy.tipo === 'ifood' ? '#EA1D2C' : 'var(--text-primary)'} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                  <span className={`vini-badge ${boy.status === 'disponivel' ? 'success' : boy.status === 'em_entrega' ? 'warning' : 'secondary'}`}>
                    {boy.status === 'disponivel' ? 'Disponível' : boy.status === 'em_entrega' ? 'Em Entrega' : 'Offline'}
                  </span>
                  {boy.tipo === 'ifood' && <span style={{ fontSize: '0.6rem', fontWeight: '900', color: '#EA1D2C' }}>PORTAL IFOOD ADQUIRIDO</span>}
                </div>
              </div>

              <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: boy.tipo === 'ifood' ? '#EA1D2C' : 'inherit' }}>{boy.nome}</h3>
              <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <Phone size={14} /> {boy.telefone}
              </p>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Entregas Hoje</div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{boy.entregas}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Diária</div>
                  <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--c-green)' }}>R$ {(boy.ganho_dia || 0).toFixed(2)}</div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                <button className="vini-btn-outline" style={{ flex: 1, fontSize: '0.8rem' }}>Histórico</button>
                <button className="vini-btn-outline" style={{ flex: 1, fontSize: '0.8rem', color: 'var(--c-red)' }} onClick={() => handleRemove(boy.id)}>Remover</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="vini-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="vini-glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>Novo Entregador</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className={`vini-btn-outline ${newBoy.tipo === 'ifood' ? 'active' : ''}`} 
                  style={{ flex: 1, borderColor: '#EA1D2C', color: newBoy.tipo === 'ifood' ? '#fff' : '#EA1D2C', background: newBoy.tipo === 'ifood' ? '#EA1D2C' : 'transparent' }}
                  onClick={() => setNewBoy({...newBoy, tipo: 'ifood'})}
                >iFood Entrega</button>
                <button 
                  className={`vini-btn-outline ${newBoy.tipo === 'freelancer' ? 'active' : ''}`} 
                  style={{ flex: 1, background: newBoy.tipo === 'freelancer' ? 'var(--c-blue)' : 'transparent' }}
                  onClick={() => setNewBoy({...newBoy, tipo: 'freelancer'})}
                >Freelancer</button>
              </div>
              <input 
                type="text" 
                placeholder="Nome do Entregador" 
                className="vini-input-dark" 
                style={{ width: '100%' }} 
                value={newBoy.nome}
                onChange={e => setNewBoy({...newBoy, nome: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="WhatsApp" 
                className="vini-input-dark" 
                style={{ width: '100%' }} 
                value={newBoy.telefone}
                onChange={e => setNewBoy({...newBoy, telefone: e.target.value})}
              />
              <select 
                className="vini-input-dark" 
                style={{ width: '100%' }}
                value={newBoy.veiculo}
                onChange={e => setNewBoy({...newBoy, veiculo: e.target.value})}
              >
                <option>Moto</option>
                <option>Carro</option>
                <option>Bicicleta</option>
              </select>
              <button className="btn vini-btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={handleAdd}>Salvar Cadastro</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Motoboys;
