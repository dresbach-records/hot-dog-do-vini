import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ShoppingBag, CreditCard, Gift, Phone, AlertTriangle, ArrowRight, CheckCircle2, Clock, Copy, Receipt, UtensilsCrossed } from 'lucide-react';
import { useClientes } from '../context/ClientesContext';
import { supabase } from '../lib/supabaseClient';

const portalStyles = {
  container: {
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    backgroundColor: '#b91c1c', 
    color: '#ffffff',
    padding: '1.5rem',
    borderBottomLeftRadius: '24px',
    borderBottomRightRadius: '24px',
    boxShadow: '0 4px 20px rgba(185, 28, 28, 0.3)',
  },
  content: {
    flex: 1,
    padding: '1.5rem',
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    marginBottom: '1.5rem'
  },
  button: {
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  }
};

function PortalCliente({ session }) {
  const { clientes, loading: contextLoading, adicionarCliente } = useClientes();
  const [provisioning, setProvisioning] = useState(false);
  const provisionAttempted = useRef(false);

  const clienteLogado = useMemo(() => {
    if (!clientes || !session?.user) return null;
    return clientes.find(c => c.id_auth === session.user.id);
  }, [clientes, session]);

  useEffect(() => {
    const autoCreateProfile = async () => {
      if (!contextLoading && !clienteLogado && session?.user && !provisionAttempted.current) {
        provisionAttempted.current = true;
        setProvisioning(true);
        try {
          await adicionarCliente({
            nome: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            id_auth: session.user.id,
            email: session.user.email,
            total: 0,
            saldo_devedor: 0
          });
        } catch (err) {
          console.error("Erro no auto-provisionamento:", err);
        } finally {
          setProvisioning(false);
        }
      }
    };
    autoCreateProfile();
  }, [clienteLogado, contextLoading, session, adicionarCliente]);

  const catalogoDisponivel = [
    { id: '101', cat: 'Pastéis Especiais', nome: 'Pastelão Carne Moída C/Queijo', preco: 26.99 },
    { id: '102', cat: 'Pastéis Especiais', nome: 'Frango com Catupiry', preco: 27.99 },
    { id: '103', cat: 'Salgados', nome: 'Bacon e Muçarela', preco: 28.99 },
    { id: '111', cat: 'Bebidas', nome: 'Refri Fruki 600ml', preco: 6.50 },
  ];

  const fidelidade = useMemo(() => {
    if (!clienteLogado) return { gastoCliente: 0, saldo: 0, isEligible: false };
    return { 
      gastoCliente: Number(clienteLogado.total_cliente || 0), 
      saldo: Number(clienteLogado.saldo_devedor || 0), 
      isEligible: Number(clienteLogado.total_cliente || 0) >= 100 && Number(clienteLogado.saldo_devedor || 0) === 0 
    };
  }, [clienteLogado]);

  const statusPrazo = useMemo(() => {
    if (!clienteLogado || !clienteLogado.vencimento) return null;
    try {
      const venceEm = new Date(clienteLogado.vencimento + 'T12:00:00');
      const hoje = new Date(); 
      venceEm.setHours(0,0,0,0);
      hoje.setHours(0,0,0,0);
      
      if (venceEm < hoje) {
        const diffTime = Math.abs(hoje - venceEm);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { msg: `Atrasado há ${diffDays} dias`, severity: 'crimson', bg: '#ffe4e6' };
      } else if (venceEm.getTime() === hoje.getTime()) {
        return { msg: 'Vence Hoje', severity: '#b45309', bg: '#fef3c7' };
      } else {
        const diffTime = Math.abs(venceEm - hoje);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { msg: `Vence em ${diffDays} dias`, severity: '#15803d', bg: '#dcfce7' };
      }
    } catch(e) { return null; }
  }, [clienteLogado]);

  const [showPix, setShowPix] = useState(false);

  // IMPORTANTE: Se não carregou nada ainda ou está criando perfil, MOSTRAR LOADING
  if (contextLoading || provisioning || (provisionAttempted.current && !clienteLogado)) {
    return (
      <div style={{ ...portalStyles.container, justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <h2 style={{ color: '#b91c1c', marginBottom: '1.5rem' }}>Carregando seu portal...</h2>
        <button 
          onClick={() => supabase.auth.signOut()} 
          style={{ ...portalStyles.button, backgroundColor: '#1e293b', color: '#fff', maxWidth: '200px' }}
        >
          Cancelar / Sair
        </button>
      </div>
    );
  }

  // Se o carregamento terminou e mesmo assim não temos cliente (e nem estamos tentando criar agora), algo falhou.
  if (!clienteLogado) {
    return (
      <div style={{ ...portalStyles.container, justifyContent: 'center', alignItems: 'center', padding: '1.5rem' }}>
        <div style={{ ...portalStyles.card, width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <ShoppingBag size={40} color="#dc2626" style={{ marginBottom: '1rem' }} />
          <h2 style={{ color: '#1e293b' }}>Ops! Perfil não encontrado</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>Não conseguimos carregar seus dados. Tente sair e entrar novamente.</p>
          <button onClick={() => supabase.auth.signOut()} style={{ ...portalStyles.button, backgroundColor: '#1e293b', color: '#fff' }}>Sair</button>
        </div>
      </div>
    );
  }

  return (
    <div style={portalStyles.container}>
      <div style={portalStyles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontWeight: '700', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} /> Vini's Delivery
          </span>
          <button onClick={() => supabase.auth.signOut()} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer' }}>
            Sair
          </button>
        </div>
        <h1 style={{ margin: '0', fontSize: '1.6rem', fontWeight: '600' }}>Olá, {clienteLogado?.nome ? clienteLogado.nome.split(' ')[0] : 'Cliente'} 👋</h1>
        <p style={{ margin: '0.5rem 0 0', opacity: 0.9, fontSize: '0.85rem' }}>Seu portal financeiro e de fidelidade.</p>
      </div>

      <div style={portalStyles.content}>
        {fidelidade.saldo > 0 ? (
          <div>
            <div style={{ ...portalStyles.card, backgroundColor: '#fef2f2', border: '1px solid #fca5a5' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ backgroundColor: '#fee2e2', padding: '0.8rem', borderRadius: '12px' }}>
                  <AlertTriangle color="#dc2626" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0, color: '#991b1b' }}>Fatura Aberta</h3>
                    {statusPrazo && <span style={{ fontSize: '0.7rem', fontWeight: 'bold', background: statusPrazo.bg, color: statusPrazo.severity, padding: '0.2rem 0.5rem', borderRadius: '10px' }}>{statusPrazo.msg}</span>}
                  </div>
                  <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#7f1d1d', margin: '0.5rem 0' }}>R$ {fidelidade.saldo.toFixed(2).replace('.', ',')}</div>
                  <button onClick={() => setShowPix(!showPix)} style={{ ...portalStyles.button, backgroundColor: '#dc2626', color: '#fff' }}>PIX Copia e Cola <ArrowRight size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ ...portalStyles.card, backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <CheckCircle2 color="#16a34a" />
                <h3 style={{ margin: '0', color: '#166534' }}>Tudo Pago!</h3>
             </div>
          </div>
        )}

        <div style={{ ...portalStyles.card, marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
            <Gift color="#6366f1" size={24} />
            <h3 style={{ margin: 0 }}>Sorteios</h3>
          </div>
          <div style={{ backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
            <div>
               <div style={{ fontSize: '0.7rem', color: '#64748b' }}>CONSUMO</div>
               <strong>R$ {fidelidade.gastoCliente.toFixed(2).replace('.', ',')}</strong>
            </div>
            <div>
               <div style={{ fontSize: '0.7rem', color: '#64748b' }}>STATUS</div>
               <strong style={{ color: fidelidade.isEligible ? '#16a34a' : '#dc2626' }}>{fidelidade.isEligible ? 'Elegível' : 'Bloqueado'}</strong>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Bateu Aquela Fome?</h3>
          {catalogoDisponivel.map(item => (
            <div key={item.id} style={{ display: 'flex', backgroundColor: '#fff', borderRadius: '12px', padding: '1rem', marginBottom: '0.8rem', gap: '1rem', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
              <UtensilsCrossed size={20} color="#cbd5e1" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{item.nome}</div>
                <div style={{ color: '#b91c1c', fontWeight: '700' }}>R$ {item.preco.toFixed(2).replace('.', ',')}</div>
              </div>
              <button style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', color: '#b91c1c', fontWeight: '600' }}>Pedir</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PortalCliente;
