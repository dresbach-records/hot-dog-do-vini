import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User, 
  MapPin, 
  Phone, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  FileText,
  AlertCircle,
  Clock,
  Check
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useClientes } from '../context/ClientesContext';

const ConveniosFlow = ({ session }) => {
  const { empresas, solicitacoes, criarSolicitacao, loading: contextLoading } = useClientes();
  const [step, setStep] = useState(1); // 1: Seleção, 2: Dados, 3: Termo, 4: Status
  const [selectedEmpresa, setSelectedEmpresa] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userData, setUserData] = useState({
    nome: session?.user?.user_metadata?.full_name || '',
    cpf: '',
    telefone: ''
  });
  const [termoAceito, setTermoAceito] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user already has a solicitation
  const existingSolicitation = solicitacoes.find(s => s.cliente_id === session?.user?.id);

  useEffect(() => {
    if (existingSolicitation) {
      setStep(4);
    }
  }, [existingSolicitation]);

  const filteredEmpresas = empresas.filter(e => 
    e.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.cnpj.includes(searchTerm)
  );

  const handleNextStep = () => {
    if (step === 1 && !selectedEmpresa) return;
    if (step === 2 && (!userData.cpf || !userData.telefone)) return;
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!termoAceito) return;
    setLoading(true);
    try {
      await criarSolicitacao({
        cliente_id: session.user.id,
        empresa_id: selectedEmpresa.id,
        dados_funcionario: userData,
        termo_versao: '1.0',
        ip_registro: 'automático' // Idealmente pegar via API
      });
      setStep(4);
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar solicitação.");
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading) return <div className="vini-flow-loading">Carregando...</div>;

  return (
    <div className="vini-flow-container">
      <header className="vini-flow-header">
        <button onClick={() => window.history.back()} className="vini-back-btn">
          <ArrowLeft size={24} />
        </button>
        <img src="/Logo-VINI.png" alt="Vini" className="vini-flow-logo" />
      </header>

      <main className="vini-flow-content">
        {step === 1 && (
          <div className="vini-step">
            <h1 className="vini-step-title">Selecione sua Empresa</h1>
            <p className="vini-step-subtitle">Busque pela empresa onde você trabalha.</p>
            
            <div className="vini-search-box">
              <input 
                type="text" 
                placeholder="Nome ou CNPJ da empresa..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="vini-empresas-list">
              {filteredEmpresas.map(emp => (
                <div 
                  key={emp.id} 
                  className={`vini-empresa-card ${selectedEmpresa?.id === emp.id ? 'active' : ''}`}
                  onClick={() => setSelectedEmpresa(emp)}
                >
                  <div className="vini-empresa-icon">
                    <Building2 size={24} />
                  </div>
                  <div className="vini-empresa-info">
                    <span className="vini-empresa-name">{emp.nome}</span>
                    <span className="vini-empresa-cnpj">CNPJ: {emp.cnpj}</span>
                  </div>
                  {selectedEmpresa?.id === emp.id && <CheckCircle2 className="vini-check" size={20} />}
                </div>
              ))}
            </div>

            <button 
              className="vini-next-btn" 
              disabled={!selectedEmpresa}
              onClick={handleNextStep}
            >
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="vini-step">
            <h1 className="vini-step-title">Confirme seus Dados</h1>
            <p className="vini-step-subtitle">Verifique se as informações abaixo estão corretas.</p>

            <div className="vini-form">
              <div className="vini-input-group">
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  value={userData.nome}
                  onChange={(e) => setUserData({...userData, nome: e.target.value})}
                />
              </div>
              <div className="vini-input-group">
                <label>CPF</label>
                <input 
                  type="text" 
                  placeholder="000.000.000-00"
                  value={userData.cpf}
                  onChange={(e) => setUserData({...userData, cpf: e.target.value})}
                />
              </div>
              <div className="vini-input-group">
                <label>Telefone</label>
                <input 
                  type="text" 
                  placeholder="(00) 00000-0000"
                  value={userData.telefone}
                  onChange={(e) => setUserData({...userData, telefone: e.target.value})}
                />
              </div>
            </div>

            <button className="vini-next-btn" onClick={handleNextStep}>
              Confirmar Dados
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="vini-step">
            <h1 className="vini-step-title">Termo de Convênio</h1>
            <p className="vini-step-subtitle">Leia os termos para ativação do seu benefício.</p>

            <div className="vini-termo-box">
              <h3>Termos e Condições</h3>
              <p>
                Ao solicitar o convênio corporativo, você concorda que as compras realizadas através desta modalidade 
                serão vinculadas à empresa <strong>{selectedEmpresa?.nome}</strong>. 
                Os valores consumidos serão gerenciados e podem ser descontados conforme política interna ou pagos via PIX.
              </p>
              <p>
                O limite concedido é de caráter pessoal e intransferível. 
                O uso indevido pode acarretar em bloqueio imediato do benefício.
              </p>
            </div>

            <label className="vini-checkbox-label">
              <input 
                type="checkbox" 
                checked={termoAceito}
                onChange={(e) => setTermoAceito(e.target.checked)}
              />
              <span>Li e concordo com os termos de convênio</span>
            </label>

            <button 
              className="vini-next-btn" 
              disabled={!termoAceito || loading}
              onClick={handleSubmit}
            >
              {loading ? 'Processando...' : 'Assinar e solicitar convênio'}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="vini-step status-step">
            <div className="vini-status-icon">
              {existingSolicitation?.status === 'ativo' ? (
                <CheckCircle2 size={80} color="#22C55E" />
              ) : (
                <Clock size={80} color="#EAB308" />
              )}
            </div>
            <h1 className="vini-step-title">
              {existingSolicitation?.status === 'ativo' ? 'Convênio Ativo!' : 'Em Análise'}
            </h1>
            <p className="vini-step-subtitle">
              {existingSolicitation?.status === 'ativo' 
                ? 'Seu convênio já está liberado para uso em nossa rede.' 
                : 'Seu pedido de convênio corporativo está sendo analisado por nossa equipe e pode levar até 72 horas.'}
            </p>

            <div className="vini-status-card">
              <div className="vini-status-row">
                <span>Empresa:</span>
                <strong>{selectedEmpresa?.nome || existingSolicitation?.empresa?.nome || 'Consultando...'}</strong>
              </div>
              <div className="vini-status-row">
                <span>Status:</span>
                <span className={`badge ${existingSolicitation?.status || 'pendente'}`}>
                  {existingSolicitation?.status === 'pendente_gestor' ? 'Aguardando Gestor' : 
                   existingSolicitation?.status === 'ativo' ? 'Aprovado' : 'Em Análise'}
                </span>
              </div>
            </div>

            <button className="vini-next-btn secondary" onClick={() => window.location.href = '/cliente.vinis'}>
              Voltar ao Início
            </button>
          </div>
        )}
      </main>

      <style jsx>{`
        .vini-flow-container {
          min-height: 100vh;
          background: #fff;
          display: flex;
          flex-direction: column;
        }
        .vini-flow-header {
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border-bottom: 1px solid #f0f0f0;
        }
        .vini-back-btn {
          position: absolute;
          left: 20px;
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
        }
        .vini-flow-logo {
          height: 40px;
        }
        
        .vini-flow-content {
          flex: 1;
          max-width: 600px;
          margin: 0 auto;
          width: 100%;
          padding: 40px 20px;
        }
        
        .vini-step {
          animation: fadeIn 0.3s ease-out;
        }
        .vini-step-title {
          font-size: 32px;
          font-weight: 900;
          margin: 0 0 10px;
          color: #1a1a1a;
        }
        .vini-step-subtitle {
          font-size: 16px;
          color: #666;
          margin-bottom: 30px;
        }
        
        .vini-search-box input {
          width: 100%;
          padding: 15px 20px;
          border: 2px solid #f0f0f0;
          border-radius: 12px;
          font-size: 16px;
          margin-bottom: 20px;
        }
        .vini-search-box input:focus { outline: none; border-color: var(--p-red); }
        
        .vini-empresas-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 40px;
        }
        .vini-empresa-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          border: 2px solid #f5f5f5;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .vini-empresa-card.active {
          border-color: var(--p-red);
          background: #fef2f2;
        }
        .vini-empresa-icon {
          background: #fff;
          padding: 10px;
          border-radius: 10px;
          color: var(--p-red);
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .vini-empresa-info {
          flex: 1;
        }
        .vini-empresa-name {
          display: block;
          font-weight: 700;
          font-size: 16px;
        }
        .vini-empresa-cnpj {
          font-size: 12px;
          color: #999;
        }
        
        .vini-next-btn {
          width: 100%;
          background: var(--p-red);
          color: #fff;
          border: none;
          padding: 18px;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .vini-next-btn:disabled { background: #eee; color: #999; cursor: not-allowed; }
        .vini-next-btn:not(:disabled):hover { transform: scale(1.02); }
        .vini-next-btn.secondary { background: #f5f5f5; color: #666; margin-top: 20px; }
        
        .vini-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 40px;
        }
        .vini-input-group label {
          display: block;
          font-weight: 700;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .vini-input-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        
        .vini-termo-box {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 16px;
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 20px;
          font-size: 14px;
          line-height: 1.6;
          color: #555;
        }
        
        .vini-checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 40px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }
        
        .vini-status-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 30px;
        }
        .vini-status-card {
          background: #f9f9f9;
          padding: 25px;
          border-radius: 20px;
          margin-bottom: 40px;
        }
        .vini-status-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px dashed #eee;
        }
        .vini-status-row:last-child { border: none; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ConveniosFlow;
