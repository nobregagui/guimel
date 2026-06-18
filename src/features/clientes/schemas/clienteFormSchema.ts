import { z } from 'zod'

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export const clienteFormSchema = z
  .object({
    tipo: z.enum(['pf', 'pj']),
    nome: z.string().trim().min(2, 'Informe o nome completo ou razão social'),
    nomeFantasia: z.string().trim(),
    documento: z.string().trim().min(1, 'Informe o CPF ou CNPJ'),
    email: z
      .string()
      .trim()
      .min(1, 'Informe o e-mail')
      .email('Informe um e-mail válido'),
    telefone: z.string().trim().min(1, 'Informe o telefone'),
    segmento: z.string().trim().min(1, 'Selecione um segmento'),
    cidade: z.string().trim().min(2, 'Informe a cidade'),
    estado: z.string().trim().length(2, 'Selecione o estado'),
    observacao: z.string().trim().min(1, 'Informe as observações'),
    formaPagamentoPreferida: z.enum(['boleto', 'pix', 'transferencia', 'cartao', 'debito'], {
      message: 'Selecione uma forma de pagamento',
    }),
    parcelasPreferidas: z.number().int().min(1).max(12),
    taxaJurosMensalPreferida: z.number().min(0).max(100),
  })
  .superRefine((data, ctx) => {
    const documentoDigits = onlyDigits(data.documento)

    if (data.tipo === 'pf') {
      if (documentoDigits.length !== 11) {
        ctx.addIssue({
          code: 'custom',
          message: 'Informe um CPF válido com 11 dígitos',
          path: ['documento'],
        })
      }
    } else if (documentoDigits.length !== 14) {
      ctx.addIssue({
        code: 'custom',
        message: 'Informe um CNPJ válido com 14 dígitos',
        path: ['documento'],
      })
    }

    if (data.tipo === 'pj' && data.nomeFantasia.length < 2) {
      ctx.addIssue({
        code: 'custom',
        message: 'Informe o nome fantasia',
        path: ['nomeFantasia'],
      })
    }

    const telefoneDigits = onlyDigits(data.telefone)
    if (telefoneDigits.length !== 10 && telefoneDigits.length !== 11) {
      ctx.addIssue({
        code: 'custom',
        message: 'Informe um telefone válido com DDD',
        path: ['telefone'],
      })
    }
  })

export type ClienteFormSchema = z.infer<typeof clienteFormSchema>
