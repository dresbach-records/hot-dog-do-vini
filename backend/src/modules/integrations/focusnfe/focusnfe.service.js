
import axios from 'axios';
import { query } from '../../../config/database.js';
import crypto from 'node:crypto';

/**
 * FocusNFe Service — Integração com API v2
 * Documentação: https://focusnfe.com.br/doc/
 */
export const focusnfeService = {
  
  getAuth() {
    const token = process.env.FOCUSNFE_TOKEN;
    // Auth Basic: token: (senha em branco)
    return Buffer.from(`${token}:`).toString('base64');
  },

  getBaseUrl() {
    const env = process.env.FOCUSNFE_ENV || 'homologacao';
    return env === 'producao' 
      ? 'https://api.focusnfe.com.br' 
      : 'https://homologacao.focusnfe.com.br';
  },

  /**
   * Mapeia um pedido do banco para o formato JSON da FocusNFe
   */
  async mapOrderToNFCe(pedidoId) {
    const [pedido] = await query('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
    if (!pedido) throw new Error('Pedido não encontrado');

    const [cliente] = await query('SELECT * FROM clientes WHERE id = ?', [pedido.cliente_id]);
    
    const itens = JSON.parse(pedido.itens);
    const endereco = JSON.parse(pedido.endereco_entrega || '{}');

    // Mapeamento dos itens processados com impostos
    const mappedItems = await Promise.all(itens.map(async (item, index) => {
      // Buscar dados fiscais do produto direto do banco (recém migrados)
      const [prodFiscal] = await query('SELECT ncm, cfop, icms_origem, icms_situacao_tributaria FROM produtos WHERE id = ?', [item.id]);

      return {
        numero_item: (index + 1).toString(),
        codigo_produto: item.id.substring(0, 8),
        descricao: item.titulo,
        cfop: prodFiscal?.cfop || '5102',
        unidade_comercial: 'un',
        quantidade_comercial: item.quantidade.toString(),
        valor_unitario_comercial: item.preco_unitario.toString(),
        valor_unitario_tributavel: item.preco_unitario.toString(),
        unidade_tributavel: 'un',
        codigo_ncm: (prodFiscal?.ncm || '2106.90.90').replace('.', ''),
        quantidade_tributavel: item.quantidade.toString(),
        valor_bruto: item.subtotal.toString(),
        icms_situacao_tributaria: prodFiscal?.icms_situacao_tributaria || '102',
        icms_origem: (prodFiscal?.icms_origem || 0).toString(),
        pis_situacao_tributaria: '07',
        cofins_situacao_tributaria: '07'
      };
    }));

    // Determinar forma de pagamento (mapear nosso BD para Focus)
    // 01: Dinheiro, 03: Cartão Crédito, 04: Cartão Débito, 17: PIX
    const mapPagamento = (metodo) => {
      const m = metodo.toLowerCase();
      if (m.includes('dinheiro')) return '01';
      if (m.includes('cartao') || m.includes('crédito')) return '03';
      if (m.includes('débito')) return '04';
      if (m.includes('pix')) return '17';
      return '99'; // Outros
    };

    const nfceData = {
      natureza_operacao: 'Venda ao Consumidor',
      data_emissao: new Date().toISOString(),
      presenca_comprador: '1', // Presencial (ajustar se for Delivery puro)
      cnpj_emitente: '63073948000197', // Extraído do certificado informado
      modalidade_frete: '9', // Sem frete (NFCe)
      local_destino: '1', // Operação Interna
      
      // Destinatário Opcional na NFCe (Identifica se CPF estiver presente)
      nome_destinatario: cliente?.nome || 'CONSUMIDOR FINAL',
      cpf_destinatario: cliente?.cpf || '',
      inscricao_estadual_destinatario: '',
      indicador_inscricao_estadual_destinatario: '9',

      items: mappedItems,
      formas_pagamento: [
        {
          forma_pagamento: mapPagamento(pedido.forma_pagamento),
          valor_pagamento: pedido.total.toString()
        }
      ]
    };

    return nfceData;
  },

  /**
   * Envia o pedido para a API do FocusNFe
   */
  async emitirNFCe(pedidoId) {
    try {
      console.log(`[FocusNFe] Iniciando emissão para pedido ${pedidoId}`);
      
      const ref = `ped_${pedidoId.substring(0, 8)}_${Date.now().toString().slice(-4)}`;
      const data = await this.mapOrderToNFCe(pedidoId);

      const response = await axios.post(
        `${this.getBaseUrl()}/v2/nfce?ref=${ref}`,
        data,
        {
          headers: {
            'Authorization': `Basic ${this.getAuth()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const result = response.data;
      
      // Salvar no banco de dados
      await query(
        `INSERT INTO pedido_emissao_fiscal (
          id, pedido_id, ref, status, chave_nfe, numero, serie, xml_url, danfe_url, mensagem_sefaz, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          pedidoId,
          ref,
          result.status,
          result.chave_nfe || null,
          result.numero || null,
          result.serie || null,
          result.caminho_xml_nota_fiscal || null,
          result.caminho_danfe || null,
          result.mensagem_sefaz || null,
          new Date()
        ]
      );

      console.log(`[FocusNFe] Resultado: ${result.status} para REF: ${ref}`);
      return { success: true, result };

    } catch (err) {
      const errorMsg = err.response?.data?.mensagem || err.message;
      console.error(`[FocusNFe Error] Pedido ${pedidoId}:`, errorMsg);
      
      // Registrar falha se possível
      if (pedidoId) {
        await query(
          'INSERT INTO pedido_emissao_fiscal (id, pedido_id, ref, status, mensagem_sefaz, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [crypto.randomUUID(), pedidoId, 'ERROR_' + Date.now(), 'erro_api', errorMsg, new Date()]
        );
      }
      
      return { success: false, error: errorMsg };
    }
  }
};
