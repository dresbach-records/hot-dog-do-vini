import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const ClientesContext = createContext();

export const ClientesProvider = ({ children }) => {
  const [clientes, setClientes] = useState([]);
  const [resumo, setResumo] = useState({
    total_pedidos: 0,
    total_vendas_estimado: 0,
    total_recebido_confirmado: 0,
    total_em_aberto_estimado: 0
  });
  const [pagamentosConfirmados, setPagamentosConfirmados] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados iniciais do Supabase
  const fetchData = async () => {
    setLoading(true);
    
    // 1. Buscar Clientes
    const { data: clientesData, error: clientesError } = await supabase
      .from('clientes')
      .select('*, pedidos(*)');

    if (clientesError) {
      console.error('Erro ao buscar clientes:', clientesError);
    } else {
      setClientes(clientesData || []);
      
      // Calcular Resumo e Pagamentos
      let totalVendas = 0;
      let totalPago = 0;
      let totalPendentes = 0;
      let countPedidos = 0;
      const pagosIds = [];

      clientesData?.forEach(c => {
        totalVendas += Number(c.total_cliente || 0);
        totalPago += Number(c.total_pago || 0);
        totalPendentes += Number(c.saldo_devedor || 0);
        countPedidos += c.pedidos?.length || 0;
        
        if (Number(c.saldo_devedor) === 0 && Number(c.total_cliente) > 0) {
          pagosIds.push(c.id);
        }
      });

      setResumo({
        total_pedidos: countPedidos,
        total_vendas_estimado: totalVendas,
        total_recebido_confirmado: totalPago,
        total_em_aberto_estimado: totalPendentes
      });
      setPagamentosConfirmados(pagosIds);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Adicionar Cliente no Banco Real (com verificação de duplicidade)
  const adicionarCliente = async (dados) => {
    // 1. Verificar se o cliente já existe por ID de Auth ou Email
    const { data: existing, error: checkError } = await supabase
      .from('clientes')
      .select('id')
      .or(`id_auth.eq.${dados.id_auth},email.eq.${dados.email}`)
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
        id_auth: dados.id_auth,
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

  return (
    <ClientesContext.Provider value={{
      clientes,
      resumo,
      pagamentosConfirmados,
      loading,
      fetchData,
      atualizarCliente,
      adicionarCliente
    }}>
      {children}
    </ClientesContext.Provider>
  );
};

export const useClientes = () => useContext(ClientesContext);
