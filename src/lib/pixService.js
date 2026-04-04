/**
 * pixService.js — Gerador de Payload PIX (padrão EMV/BR Code)
 * Vini's ERP — Pagamentos via PIX por chave CNPJ
 */

// Configuração base do PIX (lida do .env)
const PIX_CHAVE = import.meta.env.VITE_PIX_CHAVE_CNPJ || '00.000.000/0001-00';
const PIX_NOME = import.meta.env.VITE_PIX_NOME_BENEFICIARIO || "Vini's Hot Dog";
const PIX_CIDADE = import.meta.env.VITE_PIX_CIDADE || 'SAO PAULO';

/**
 * Calcula CRC16-CCITT para o payload PIX
 */
function calcCRC16(str) {
  let crc = 0xffff;
  const strlen = str.length;
  for (let c = 0; c < strlen; c++) {
    crc ^= str.charCodeAt(c) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
      else crc <<= 1;
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Formata um campo EMV: ID + tamanho + valor
 */
function emvField(id, value) {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * Gera o payload PIX copia-e-cola (string EMV)
 * @param {number} valor - Valor em R$ (ex: 29.90)
 * @param {string} descricao - Descrição curta do pagamento
 * @param {string} txId - ID único da transação (opcional)
 * @returns {string} Payload PIX para copia-e-cola
 */
export function gerarPixCopiaECola(valor, descricao = 'Vinis Delivery', txId = '***') {
  // Limpa a chave PIX (remove pontos, barras, hífens)
  const chaveFormatada = PIX_CHAVE.replace(/[.\-\/]/g, '');
  
  // Trunca campos para os limites do padrão
  const nomeFormatado = normalizarTexto(PIX_NOME).substring(0, 25).toUpperCase();
  const cidadeFormatada = normalizarTexto(PIX_CIDADE).substring(0, 15).toUpperCase();
  const descFormatada = normalizarTexto(descricao).substring(0, 72);

  // Merchant Account Info (ID 26)
  const guiPix = emvField('00', 'BR.GOV.BCB.PIX');
  const chavePix = emvField('01', PIX_CHAVE);
  const descPix = descFormatada ? emvField('02', descFormatada) : '';
  const merchantAccountInfo = emvField('26', guiPix + chavePix + descPix);

  // Valor formatado (sem vírgula, com 2 casas decimais)
  const valorFormatado = valor > 0 ? valor.toFixed(2) : null;

  // Monta payload sem CRC
  let payload = '';
  payload += emvField('00', '01');                    // Payload Format Indicator
  payload += emvField('01', '12');                    // Point of Initiation Method (dinâmico)
  payload += merchantAccountInfo;                      // Merchant Account Info
  payload += emvField('52', '0000');                  // Merchant Category Code
  payload += emvField('53', '986');                   // Transaction Currency (BRL)
  if (valorFormatado) payload += emvField('54', valorFormatado); // Transaction Amount
  payload += emvField('58', 'BR');                    // Country Code
  payload += emvField('59', nomeFormatado);            // Merchant Name
  payload += emvField('60', cidadeFormatada);          // Merchant City
  
  // Additional Data Field (ID 62) com txId
  const txIdField = emvField('05', txId.substring(0, 25));
  payload += emvField('62', txIdField);

  // CRC16 (sempre no final)
  payload += '6304';
  const crc = calcCRC16(payload);
  payload += crc;

  return payload;
}

/**
 * Normaliza texto removendo acentos e caracteres especiais
 */
function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, ' ')
    .trim();
}

/**
 * Retorna as informações de PIX formatadas para exibição
 * @param {number} valor
 * @param {string} descricao
 * @returns {{ payload: string, chave: string, nome: string, valor: string }}
 */
export function getInfoPix(valor, descricao = "Vini's Delivery") {
  return {
    payload: gerarPixCopiaECola(valor, descricao),
    chave: PIX_CHAVE,
    nome: PIX_NOME,
    valor: `R$ ${valor.toFixed(2).replace('.', ',')}`,
    tipo: 'CNPJ',
  };
}

export default { gerarPixCopiaECola, getInfoPix };
