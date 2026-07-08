import type { CashflowSeries, FinancialSummaryItem } from '@/features/dashboard/types'
import type { FinanceiroResumo } from '@/features/financeiro/utils'

export type { FinanceiroResumo }

export function normalizeCashflowSeries(series: CashflowSeries): CashflowSeries {
  const allValues = [...series.entradas, ...series.saidas, ...series.saldo]
  const max = Math.max(...allValues, 1)

  return {
    labels: series.labels,
    entradas: series.entradas.map((value) => value / max),
    saidas: series.saidas.map((value) => value / max),
    saldo: series.saldo.map((value) => value / max),
  }
}

export function buildFinancialSummaryFromResumo(resumo: FinanceiroResumo): FinancialSummaryItem[] {
  const entradas = resumo.recebido + resumo.aReceber
  const saidas = resumo.pago + resumo.aPagar
  const resultado = entradas - saidas
  const margem = entradas > 0 ? (resultado / entradas) * 100 : 0

  return [
    { id: 'entradas', label: 'Entradas', value: entradas },
    { id: 'saidas', label: 'Saídas', value: saidas },
    { id: 'resultado', label: 'Resultado', value: resultado },
    { id: 'margem', label: 'Margem', value: margem, isPercent: true },
  ]
}

export function formatActivityTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso

  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60_000)

  if (diffMin < 1) return 'Agora'
  if (diffMin < 60) return `Há ${diffMin} min`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `Há ${diffHours} h`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Ontem'
  if (diffDays < 7) return `Há ${diffDays} dias`

  return date.toLocaleDateString('pt-BR')
}
