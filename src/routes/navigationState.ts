import { isFinanceiroAba } from '@/features/financeiro/utils'
import type { FinanceiroAba } from '@/features/financeiro/types'

export type FinanceiroNavigationState = {
  aba?: FinanceiroAba
}

export function createFinanceiroNavigationState(aba: FinanceiroAba): FinanceiroNavigationState {
  return { aba }
}

export function getFinanceiroTabFromState(state: unknown): FinanceiroAba | null {
  const aba = (state as FinanceiroNavigationState | null)?.aba ?? null
  return isFinanceiroAba(aba) ? aba : null
}

export type BuscaNavigationState = {
  busca?: string
}

export function createBuscaNavigationState(busca: string): BuscaNavigationState {
  return { busca: busca.trim() }
}

export function getBuscaFromState(state: unknown): string | null {
  const busca = (state as BuscaNavigationState | null)?.busca
  if (typeof busca !== 'string') return null
  const trimmed = busca.trim()
  return trimmed || null
}
