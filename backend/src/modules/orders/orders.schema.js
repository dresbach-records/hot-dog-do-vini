import { z } from 'zod';

/**
 * Zod Schema para Validação de Pedidos (Zero Trust)
 * Sanitiza e valida a entrada do frontend
 */
export const CreateOrderSchema = z.object({
  cliente: z.object({
    nome: z.string().min(3),
    email: z.string().email(),
    telefone: z.string().optional(),
    cpf: z.string().optional()
  }),
  itens: z.array(z.object({
    id: z.string().uuid({ message: "ID do produto inválido" }),
    quantidade: z.number().int().positive({ message: "Quantidade deve ser maior que zero" }),
    // Observação: Ignoramos preço/total aqui por segurança
  })).min(1, { message: "O pedido deve ter pelo menos um item" }),
  endereco: z.object({
    rua: z.string(),
    numero: z.string(),
    complemento: z.string().optional(),
    bairro: z.string(),
    cidade: z.string(),
    cep: z.string()
  }),
  pagamento: z.object({
    metodo: z.enum(['pix', 'cartao', 'convenio', 'va']),
    tipo_resgate: z.string().optional() // Para convênios
  }),
  agendamento: z.object({
    tipo: z.string(),
    data: z.string().optional(),
    horario: z.string().optional()
  }).optional()
});
