import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

const ClientesContext = createContext();

export const ClientesProvider = ({ children }) => {
  const [clientes, setClientes] = useState([]);
  const [resumo, setResumo] = useState({
    total_pedidos: 0,
    total_vendas_estimado: 0,
    total_recebido_confirmado: 0,
    total_em_aberto_estimado: 0,
    ticket_medio: 0,
    top_produtos: [],
    vendas_por_bairro: []
  });
  const [pagamentosConfirmados, setPagamentosConfirmados] = useState([]);
  const [loading, setLoading] = useState(true);

  const [empresas, setEmpresas] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);

  // Usar Ref para evitar que o fetchData mude de identidade e cause loops infinitos
  const isFetchingRef = useRef(false);

  // Carregar dados iniciais do Backend
  const fetchData = useCallback(async (silent = false) => {
    if (isFetchingRef.current) return;
    
    if (!silent) setLoading(true);
    isFetchingRef.current = true;
    
    try {
      // 1. Buscar Clientes, Resumo Estatístico e Gráficos em paralelo
      const [resClientes, resStats, resCharts] = await Promise.all([
        api.get('/clientes'),
        api.get('/dashboard/stats'),
        api.get('/dashboard/charts')
      ]);
      
      if (resClientes.success) {
        setClientes(resClientes.data || []);
      }

      if (resStats.success && resCharts.success) {
        const s = resStats.data;
        const c = resCharts.data;
        
        // Mapear retorno do backend para o formato do context
        setResumo({
          total_pedidos: s.totalOrders,
          total_vendas_estimado: s.totalSales,
          total_recebido_confirmado: s.totalIncome,
          total_em_aberto_estimado: s.totalPending,
          ticket_medio: s.totalOrders > 0 ? (s.totalSales / s.totalOrders) : 0,
          // Mapeamento para Relatorios.jsx
          top_produtos: c.topProducts?.map(p => ({ name: p.nome, qty: p.qtd })) || [], 
          vendas_por_bairro: c.dailySales?.map(d => ({ name: d.dia, valor: d.vendas })) || [] // Simplificado para dia por enquanto
        });
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, []); // Identidade ESTÁVEL!

  const adicionarEmpresa = useCallback(async (dados) => {
    try {
      const response = await api.post('/empresas', dados);
      if (response.success) {
        fetchData();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err };
    }
  }, [fetchData]);

  // Adicionar Cliente no Banco Real (com verificação de duplicidade)
  const adicionarCliente = useCallback(async (dados) => {
    try {
      const response = await api.post('/clientes', {
        nome: dados.nome,
        email: dados.email,
        codigo_vini: dados.id_auth || dados.codigo_vini,
        total_cliente: dados.total_cliente || 0,
        total_pago: dados.total_pago || 0,
        saldo_devedor: dados.saldo_devedor || 0,
        convenio_status: 'inativo'
      });

      if (response.success) {
        fetchData();
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err };
    }
  }, [fetchData]);

  // Marcar como Pago: Zera saldo devedor e soma ao total pago
  const marcarComoPago = useCallback(async (id) => {
    // Pegamos a última versão dos clientes do estado no momento da execução
    setClientes(currentClientes => {
      const cliente = currentClientes.find(c => c.id === id);
      if (!cliente) return currentClientes;

      const novoTotalPago = Number(cliente.total_pago || 0) + Number(cliente.saldo_devedor || 0);

      api.put(`/clientes/${id}`, {
        total_pago: novoTotalPago,
        saldo_devedor: 0
      }).then(res => {
        if (res.success) fetchData();
      });

      return currentClientes; // O estado será atualizado pelo fetchData() quando o PUT terminar
    });
    return { success: true };
  }, [fetchData]);

  // Atualizar Cliente no Banco Real
  const atualizarCliente = useCallback(async (id, dadosAtualizados) => {
    try {
      const response = await api.put(`/clientes/${id}`, dadosAtualizados);
      if (response.success) {
        fetchData();
        return { success: true };
      }
      return { success: false, error: response.error || 'Erro desconhecido' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchData]);

  const excluirCliente = useCallback(async (id) => {
    try {
      const response = await api.delete(`/clientes/${id}`);
      if (response.success) {
        fetchData();
        return { success: true };
      }
      return { success: false, error: response.error || 'Erro ao excluir' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchData]);

  const gerenciarSolicitacao = useCallback(async (solId, clienteId, status, info) => {
    const updateData = { convenio_status: status };
    if (status === 'ativo') {
      updateData.convenio_limite = info.limite;
      updateData.convenio_saldo = info.limite;
    }

    try {
      const response = await api.put(`/clientes/${clienteId}`, updateData);
      if (response.success) {
        fetchData();
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    // Auto-refresh: 15s para manter o painel admin atualizado "sozinho"
    const interval = setInterval(() => {
       fetchData(true); // silent fetch
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <ClientesContext.Provider value={{
      clientes,
      empresas,
      solicitacoes,
      resumo,
      pagamentosConfirmados,
      loading,
      fetchData,
      atualizarCliente,
      adicionarCliente,
      marcarComoPago,
      adicionarEmpresa,
      gerenciarSolicitacao,
      excluirCliente
    }}>
      {children}
    </ClientesContext.Provider>
  );
};

export const useClientes = () => useContext(ClientesContext);
