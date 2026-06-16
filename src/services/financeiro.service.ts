import { api } from '@/services/api'
import type { LancamentoFinanceiro } from '@/types'

export const financeiroService = {
  async list(): Promise<LancamentoFinanceiro[]> {
    const { data } = await api.get<LancamentoFinanceiro[]>('/financeiro')
    return data
  },
}
