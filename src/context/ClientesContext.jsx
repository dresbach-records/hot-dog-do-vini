import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

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

  // Carregar dados iniciais do Supabase
  const fetchData = async () => {
    setLoading(true);
    
    // 1. Buscar Clientes
    const { data: clientesData, error: clientesError } = await supabase
      .from('clientes')
      .select('*, pedidos(*)');

    // 2. Buscar Empresas
    const { data: empresasData } = await supabase
      .from('empresas')
      .select('*')
      .order('nome');

    if (clientesError) {
      console.error('Erro ao buscar clientes:', clientesError);
    } else {
      setClientes(clientesData || []);
      setEmpresas(empresasData || []);
      
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
        // Corrigindo contagem de pedidos
        let subTotalPedidos = customerPedidos.length;
        
        customerPedidos.forEach(p => {
          countPedidos++; // Incremento global de pedidos
          
          // Processar Bairros
          const bairro = p.endereco_entrega?.bairro || 'Balcão/Outros';
          bairroMap[bairro] = (bairroMap[bairro] || 0) + Number(p.total || 0);

          // Processar Produtos (Snapshot real do JSON do pedido)
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
    
    setLoading(false);
  };

  const adicionarEmpresa = async (dados) => {
    const { data, error } = await supabase
      .from('empresas')
      .insert([dados])
      .select();

    if (error) {
      console.error('Erro ao adicionar empresa:', error);
      return { success: false, error };
    }
    
    fetchData();
    return { success: true, data };
  };

  // Adicionar Cliente no Banco Real (com verificação de duplicidade)
  const adicionarCliente = async (dados) => {
    // 1. Verificar se o cliente já existe por ID de Auth ou Email
    const { data: existing, error: checkError } = await supabase
      .from('clientes')
      .select('id')
      .or(`codigo_vini.eq.${dados.codigo_vini},email.eq.${dados.email}`)
      .maybeSingle();

    if (checkError) {
      console.error('Erro ao verificar existência do cliente:', checkError);
    }

    if (existing) {
      console.log('Cliente já cadastrado no banco de dados.');
      return { success: true, data: existing, alreadyExists: true };
    }

    // 2. Se não existir, insere
    const { data, error } = await supabase
      .from('clientes')
      .insert([{
        nome: dados.nome,
        email: dados.email,
        codigo_vini: dados.codigo_vini,
        total_cliente: dados.total_cliente || 0,
        total_pago: dados.total_pago || 0,
        saldo_devedor: dados.saldo_devedor || 0,
        convenio_status: 'inativo'
      }])
      .select();

    if (error) {
      console.error('Erro ao adicionar cliente:', error);
      return { success: false, error };
    }
    
    fetchData(); // Recarrega para manter sincronia
    return { success: true, data };
  };

  // Marcar como Pago: Zera saldo devedor e soma ao total pago
  const marcarComoPago = async (id) => {
    const cliente = clientes.find(c => c.id === id);
    if (!cliente) return { success: false, error: 'Cliente não encontrado' };

    const novoTotalPago = Number(cliente.total_pago || 0) + Number(cliente.saldo_devedor || 0);

    const { error } = await supabase
      .from('clientes')
      .update({
        total_pago: novoTotalPago,
        saldo_devedor: 0
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao marcar como pago:', error);
      return { success: false, error };
    }

    fetchData(); // Recarrega para atualizar gráficos e lista
    return { success: true };
  };

  // Atualizar Cliente no Banco Real
  const atualizarCliente = async (id, dadosAtualizados) => {
    const { error } = await supabase
      .from('clientes')
      .update(dadosAtualizados)
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar cliente:', error);
      return { success: false, error };
    }
    
    fetchData(); // Recarrega
    return { success: true };
  };

  const gerenciarSolicitacao = async (solId, clienteId, status, info) => {
    const updateData = { convenio_status: status };
    if (status === 'ativo') {
      updateData.convenio_limite = info.limite;
      updateData.convenio_saldo = info.limite;
    }

    const { error } = await supabase
      .from('clientes')
      .update(updateData)
      .eq('id', clienteId);

    if (error) return { success: false, error };
    fetchData();
    return { success: true };
  };

  useEffect(() => {
    fetchData();
  }, []);

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
