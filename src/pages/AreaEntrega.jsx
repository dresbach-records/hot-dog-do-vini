import React, { useState, useEffect } from 'react';
import { 
  MapPin, Plus, Trash2, Edit3, Save, 
  Search, AlertCircle, CheckCircle2 
} from 'lucide-react';
import api from '../services/api';
import '../styles/admin/pedidos.css'; // Reutilizando componentes de grid

function AreaEntrega() {
  const [bairros, setBairros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Novos bairros state
  const [newBairro, setNewBairro] = useState({ nome: '', taxa: '' });

  const fetchData = async () => {
    try {
      const resp = await api.get('/config');
      if (resp.success) {
        const deliveryData = resp.data.delivery_boroughs;
        if (deliveryData) {
          setBairros(JSON.parse(deliveryData));
        }
      }
    } catch (err) {
      console.error('Erro ao buscar bairros', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveToBackend = async (data) => {
    try {
      await api.post('/config', {
        configs: {
          delivery_boroughs: JSON.stringify(data)
        }
      });
      return true;
    } catch (err) {
      alert('Erro ao salvar no servidor');
      return false;
    }
  };

  const handleAdd = async () => {
    if (!newBairro.nome || !newBairro.taxa) return;
    
    const updated = [...bairros, { ...newBairro, id: Date.now() }];
    if (await saveToBackend(updated)) {
      setBairros(updated);
      setNewBairro({ nome: '', taxa: '' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este bairro?')) return;
    const updated = bairros.filter(b => b.id !== id);
    if (await saveToBackend(updated)) {
      setBairros(updated);
    }
  };

  const startEdit = (b) => {
    setEditingId(b.id);
  };

  const handleUpdate = async (id, updatedBairro) => {
    const updated = bairros.map(b => b.id === id ? updatedBairro : b);
    if (await saveToBackend(updated)) {
      setBairros(updated);
      setEditingId(null);
    }
  };

  const filteredBairros = bairros.filter(b => 
    b.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading-vini">Carregando Zonas de Entrega...</div>;

  return (
    <div className="pedidos-kanban-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Áreas de Entrega 📍</h1>
          <p>Configure bairros e taxas para o Vini's Cloud</p>
        </div>
        <div className="header-actions">
           <div className="vini-search-wrap">
              <Search size={18} />
              <input 
                placeholder="Buscar bairro..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
      </header>

      <div className="delivery-grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        {/* LISTA DE BAIRROS */}
        <div className="vini-glass-panel" style={{ background: '#fff', padding: '1.5rem', borderRadius: '24px' }}>
           <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontWeight: 800 }}>Bairros Atendidos</h3>
              <span className="count-badge">{filteredBairros.length}</span>
           </div>

           <table className="vini-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                 <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px' }}>
                    <th style={{ padding: '1rem' }}>BAIRRO</th>
                    <th style={{ padding: '1rem' }}>TAXA</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>AÇÕES</th>
                 </tr>
              </thead>
              <tbody>
                 {filteredBairros.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                       <td style={{ padding: '1rem' }}>
                          {editingId === b.id ? (
                            <input 
                              className="vini-input-inline"
                              defaultValue={b.nome} 
                              onBlur={(e) => handleUpdate(b.id, { ...b, nome: e.target.value })}
                            />
                          ) : (
                            <strong style={{ color: '#1e293b' }}>{b.nome}</strong>
                          )}
                       </td>
                       <td style={{ padding: '1rem' }}>
                          <span style={{ color: '#10b981', fontWeight: 700 }}>
                             R$ {Number(b.taxa).toFixed(2).replace('.', ',')}
                          </span>
                       </td>
                       <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                             <button className="vini-btn-action" onClick={() => startEdit(b)}><Edit3 size={16}/></button>
                             <button className="vini-btn-action danger" onClick={() => handleDelete(b.id)}><Trash2 size={16}/></button>
                          </div>
                       </td>
                    </tr>
                 ))}
                 {filteredBairros.length === 0 && (
                   <tr>
                      <td colSpan="3" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Nenhum bairro encontrado.</td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>

        {/* CADASTRO RÁPIDO */}
        <div className="vini-glass-panel" style={{ background: '#fff', padding: '1.5rem', borderRadius: '24px', alignSelf: 'start' }}>
           <div className="section-header" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 800 }}>Novo Bairro</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Adicione uma nova zona de entrega</p>
           </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                 <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px', display: 'block' }}>NOME DO BAIRRO</label>
                 <input 
                    className="vini-input-block"
                    placeholder="Ex: Recreio"
                    value={newBairro.nome}
                    onChange={(e) => setNewBairro({...newBairro, nome: e.target.value})}
                 />
              </div>

              <div className="form-group">
                 <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '5px', display: 'block' }}>TAXA DE ENTREGA (R$)</label>
                 <input 
                    className="vini-input-block"
                    type="number"
                    placeholder="0.00"
                    value={newBairro.taxa}
                    onChange={(e) => setNewBairro({...newBairro, taxa: e.target.value})}
                 />
              </div>

              <button 
                className="vini-btn-primary" 
                style={{ width: '100%', marginTop: '10px' }}
                onClick={handleAdd}
              >
                 <Plus size={18} /> Adicionar Bairro
              </button>
           </div>

           <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                 <AlertCircle size={20} color="#0284c7" />
                 <p style={{ fontSize: '11px', color: '#0369a1', lineHeight: '1.4' }}>
                    <strong>DICA VINBOT:</strong> Bairros com taxa R$ 0,00 aparecerão como "Frete Grátis" para o cliente no portal.
                 </p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

export default AreaEntrega;
