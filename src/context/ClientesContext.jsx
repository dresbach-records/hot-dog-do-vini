import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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

  const [isFetching, setIsFetching] = useState(false);

  // Carregar dados iniciais do Backend
  const fetchData = useCallback(async (silent = false) => {
    if (isFetching) return;
    if (!silent) setLoading(true);
    setIsFetching(true);
    
    try {
      // 1. Buscar Clientes (Backend já retorna com pedidos incluídos)
      const response = await api.get('/clientes');
      
      if (response.success) {
        const clientesData = response.data;
        setClientes(clientesData || []);
        
        // Calcular Resumo e Pagamentos
        let totalVendas = 0;
        let totalPago = 0;
        let totalPendentes = 0;
        let countPedidos = 0;
        const pagosIds = [];
        const produtoMap = {};
        const bairroMap = {};

        clientesData?.forEach(c => {
          totalVendas += Number(c.total_cliente || 0);
          totalPago += Number(c.total_pago || 0);
          totalPendentes += Number(c.saldo_devedor || 0);
          const customerPedidos = c.pedidos || [];
          
          customerPedidos.forEach(p => {
            countPedidos++;
            
            // Processar Bairros
            const bairro = p.endereco_entrega?.bairro || 'Balcão/Outros';
            bairroMap[bairro] = (bairroMap[bairro] || 0) + Number(p.total || 0);

            // Processar Produtos
            if (p.itens) {
              const itensArr = Array.isArray(p.itens) ? p.itens : [];
              itensArr.forEach(item => {
                const name = item.titulo || item.name || 'Produto Desconhecido';
                const qtd = Number(item.qtd || 1);
                produtoMap[name] = (produtoMap[name] || 0) + qtd;
              });
            }
          });

          if (Number(c.saldo_devedor) === 0 && Number(c.total_cliente) > 0) {
            pagosIds.push(c.id);
          }
        });

        // Formatar Top Produtos
        const topProdList = Object.entries(produtoMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, qty]) => ({ name, qty }));

        // Formatar Vendas por Bairro
        const bairroList = Object.entries(bairroMap)
          .map(([name, valor]) => ({ name, valor }))
          .sort((a, b) => b.valor - a.valor);

        setResumo({
          total_pedidos: countPedidos,
          total_vendas_estimado: totalVendas,
          total_recebido_confirmado: totalPago,
          total_em_aberto_estimado: totalPendentes,
          ticket_medio: countPedidos > 0 ? (totalVendas / countPedidos) : 0,
          top_produtos: topProdList,
          vendas_por_bairro: bairroList
        });
        setPagamentosConfirmados(pagosIds);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsFetching(false);
      setLoading(false);
    }
  }, [isFetching]);

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
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return { success: false, error: 'Cliente não encontrado' };

    const novoTotalPago = Number(cliente.total_pago || 0) + Number(cliente.saldo_devedor || 0);

    try {
      const response = await api.put(`/clientes/${id}`, {
        total_pago: novoTotalPago,
        saldo_devedor: 0
      });

      if (response.success) {
        fetchData();
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err };
    }
  }, [clientes, fetchData]);

  // Atualizar Cliente no Banco Real
  const atualizarCliente = useCallback(async (id, dadosAtualizados) => {
    try {
      const response = await api.put(`/clientes/${id}`, dadosAtualizados);
      if (response.success) {
        fetchData();
        return { success: true };
      }
      return { success: false, error: response.error };
    } catch (err) {
      return { success: false, error: err };
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
      gerenciarSolicitacao
    }}>
      {children}
    </ClientesContext.Provider>
  );
};

export const useClientes = () => useContext(ClientesContext);
