import React, { useMemo } from 'react';
import { 
  Star, 
  Gift, 
  Zap, 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';
import { useClientes } from '../../context/ClientesContext';

const Fidelidade = ({ session }) => {
  const { clientes } = useClientes();
  const clienteLogado = useMemo(() => {
    return clientes.find(c => c.codigo_vini === session?.user?.id);
  }, [clientes, session]);

  const stats = useMemo(() => {
    const total = Number(clienteLogado?.total_cliente || 0);
    const points = Math.floor(total);
    const nextReward = 500; // Reward at every 500 points
    const progress = (points % nextReward) / nextReward * 100;
    return { points, nextReward, progress, totalPoints: points };
  }, [clienteLogado]);

  const rewards = [
    { points: 100, title: 'Cupom de R$ 10', icon: <Gift size={20} />, status: stats.totalPoints >= 100 ? 'ready' : 'locked' },
    { points: 250, title: 'Dog Simples Grátis', icon: <Star size={20} />, status: stats.totalPoints >= 250 ? 'ready' : 'locked' },
    { points: 500, title: 'Combo Casal Grátis', icon: <Zap size={20} />, status: stats.totalPoints >= 500 ? 'ready' : 'locked' },
  ];

  return (
    <div className="vini-fidelidade-container">
      <header className="vini-fidelidade-header">
        <button onClick={() => window.history.back()} className="vini-back-btn">
          <ArrowLeft size={24} />
        </button>
        <h1 className="vini-fidelidade-title">Fidelidade Vini's</h1>
      </header>

      <main className="vini-fidelidade-content">
        <div className="vini-points-card">
           <div className="vini-points-label">Seus Pontos Acumulados</div>
           <div className="vini-points-value">{stats.totalPoints}</div>
           <div className="vini-points-sub">R$ 1,00 gasto = 1 ponto</div>
           
           <div className="vini-progress-container">
              <div className="vini-progress-bar" style={{ width: `${stats.progress}%` }}></div>
           </div>
           <div className="vini-progress-labels">
              <span>{Math.floor(stats.points / stats.nextReward) * stats.nextReward}</span>
              <span>{Math.ceil((stats.points + 1) / stats.nextReward) * stats.nextReward}</span>
           </div>
           <p className="vini-points-footer">
              Faltam {stats.nextReward - (stats.points % stats.nextReward)} pontos para seu próximo prêmio!
           </p>
        </div>

        <h3 className="vini-section-title">Prêmios Disponíveis</h3>
        <div className="vini-rewards-list">
           {rewards.map((reward, i) => (
             <div key={i} className={`vini-reward-item ${reward.status}`}>
                <div className="vini-reward-icon">{reward.icon}</div>
                <div className="vini-reward-info">
                   <div className="vini-reward-title">{reward.title}</div>
                   <div className="vini-reward-points">{reward.points} pontos</div>
                </div>
                {reward.status === 'ready' ? (
                  <button className="vini-btn-rescue">Resgatar</button>
                ) : (
                  <div className="vini-reward-lock">Bloqueado</div>
                )}
             </div>
           ))}
        </div>

        <div className="vini-fidelidade-info">
           <AlertCircle size={20} color="#999" />
           <p>Os pontos expiram em 365 dias após a data da compra. O resgate deve ser feito exclusivamente pelo portal.</p>
        </div>
      </main>

      <style jsx>{`
        .vini-fidelidade-container { min-height: 100vh; background: #f8f8fb; }
        .vini-fidelidade-header { background: #fff; padding: 20px; display: flex; align-items: center; gap: 20px; border-bottom: 1px solid #f0f0f0; }
        .vini-fidelidade-title { margin: 0; font-size: 20px; font-weight: 800; }
        
        .vini-fidelidade-content { max-width: 600px; margin: 0 auto; padding: 30px 20px; }
        
        .vini-points-card { background: var(--p-red, #EA1D2C); color: #fff; border-radius: 24px; padding: 30px; text-align: center; margin-bottom: 40px; box-shadow: 0 10px 30px rgba(234, 29, 44, 0.2); }
        .vini-points-label { font-size: 14px; opacity: 0.8; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
        .vini-points-value { font-size: 64px; font-weight: 900; margin: 10px 0; }
        .vini-points-sub { font-size: 12px; opacity: 0.7; margin-bottom: 25px; }
        
        .vini-progress-container { background: rgba(255,255,255,0.2); height: 10px; border-radius: 5px; margin-bottom: 8px; overflow: hidden; }
        .vini-progress-bar { background: #fff; height: 100%; border-radius: 5px; transition: width 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .vini-progress-labels { display: flex; justify-content: space-between; font-size: 11px; opacity: 0.8; font-weight: 700; }
        .vini-points-footer { font-size: 13px; margin-top: 20px; font-weight: 600; opacity: 0.9; }
        
        .vini-section-title { font-size: 18px; font-weight: 800; margin-bottom: 20px; }
        .vini-rewards-list { display: flex; flex-direction: column; gap: 12px; }
        .vini-reward-item { background: #fff; padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 15px; border: 1px solid #f0f0f0; }
        .vini-reward-item.locked { opacity: 0.7; grayscale(1); }
        
        .vini-reward-icon { background: #fef2f2; color: var(--p-red, #EA1D2C); padding: 12px; border-radius: 12px; }
        .vini-reward-info { flex: 1; }
        .vini-reward-title { font-weight: 800; font-size: 16px; margin-bottom: 2px; }
        .vini-reward-points { font-size: 13px; color: #999; font-weight: 600; }
        
        .vini-btn-rescue { background: var(--p-red, #EA1D2C); color: #fff; border: none; padding: 8px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: transform 0.2s; }
        .vini-reward-lock { color: #999; font-size: 12px; font-weight: 700; border: 1px solid #eee; padding: 6px 12px; border-radius: 8px; }
        
        .vini-fidelidade-info { margin-top: 40px; display: flex; gap: 12px; background: #fff; padding: 20px; border-radius: 16px; font-size: 12px; color: #666; line-height: 1.6; }
      `}</style>
    </div>
  );
};

// Mock AlertCircle if missing from imports (not strictly needed since I have Star, etc)
const AlertCircle = ({ size, color }) => <Star size={size} color={color} />;

export default Fidelidade;
