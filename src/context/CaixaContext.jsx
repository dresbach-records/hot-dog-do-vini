import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CaixaContext = createContext();

export const CaixaProvider = ({ children }) => {
  const [sessaoAtiva, setSessaoAtiva] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSessao = async () => {
    try {
      const res = await api.get('/caixa/sessao-ativa');
      if (res.success && res.data) {
        setSessaoAtiva(res.data);
      } else {
        setSessaoAtiva(null);
      }
    } catch (err) {
      console.error('Erro ao verificar sessão de caixa:', err);
      setSessaoAtiva(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSessao();
  }, []);

  const abrirCaixa = async (valorAbertura) => {
    try {
      const res = await api.post('/caixa/abrir', { valor_abertura: valorAbertura });
      if (res.success) {
        setSessaoAtiva(res.data);
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: 'Erro de conexão' };
    }
  };

  const fecharCaixa = async (sessionId, valorFechamento) => {
    try {
      const res = await api.post(`/caixa/${sessionId}/fechar`, { valor_fechamento: valorFechamento });
      if (res.success) {
        setSessaoAtiva(null);
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: 'Erro de conexão' };
    }
  };

  return (
    <CaixaContext.Provider value={{ sessaoAtiva, abrirCaixa, fecharCaixa, loading, checkSessao }}>
      {children}
    </CaixaContext.Provider>
  );
};

export const useCaixa = () => useContext(CaixaContext);
