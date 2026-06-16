export type LancamentoTipo = 'receita' | 'despesa'

export interface LancamentoFinanceiro {
  id: string
  descricao: string
  valor: number
  vencimento: string
  tipo: LancamentoTipo
  pago: boolean
}
