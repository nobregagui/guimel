import { z } from 'zod'

export const clienteFormSchema = z.object({
  tipo: z.enum(['pf', 'pj']),
  nome: z.string().trim().min(2, 'Informe o nome completo ou razão social'),
  nomeFantasia: z.string().trim(),
  documento: z.string().trim().min(11, 'Informe um CPF ou CNPJ válido'),
  email: z.string().trim().email('Informe um e-mail válido'),
  telefone: z.string().trim().min(10, 'Informe um telefone válido'),
  segmento: z.string().trim().min(1, 'Selecione um segmento'),
  cidade: z.string().trim().min(2, 'Informe a cidade'),
  estado: z.string().trim().length(2, 'Selecione o estado'),
  observacao: z.string().trim(),
  formaPagamentoPreferida: z.enum(['boleto', 'pix', 'transferencia', 'cartao', 'debito'], {
    message: 'Selecione uma forma de pagamento',
  }),
})

export type ClienteFormSchema = z.infer<typeof clienteFormSchema>
