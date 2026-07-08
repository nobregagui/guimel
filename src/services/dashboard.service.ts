import { api } from '@/services/api'
import type {
  CashflowPeriod,
  CashflowSeries,
  DashboardKpiItem,
  FinancialSummaryItem,
  ReceivableItem,
  RecentActivityItem,
} from '@/features/dashboard/types'
import {
  buildFinancialSummaryFromResumo,
  formatActivityTime,
} from '@/features/dashboard/utils'
import type { FinanceiroResumo } from '@/features/financeiro/utils'

type DashboardCashflowApi = CashflowSeries

type DashboardActivityApi = Omit<RecentActivityItem, 'time'> & { time: string }

export const dashboardService = {
  async getKpis(): Promise<DashboardKpiItem[]> {
    const { data } = await api.get<DashboardKpiItem[]>('/dashboard/kpis')
    return data
  },

  async getCashflow(periodo: CashflowPeriod = 'mes'): Promise<CashflowSeries> {
    const { data } = await api.get<DashboardCashflowApi>('/dashboard/cashflow', {
      params: { periodo },
    })
    console.log('[dashboard/cashflow]', { periodo, data })
    return data
  },

  async getReceivables(): Promise<ReceivableItem[]> {
    const { data } = await api.get<ReceivableItem[]>('/dashboard/receivables')
    return data
  },

  async getActivities(): Promise<RecentActivityItem[]> {
    const { data } = await api.get<DashboardActivityApi[]>('/dashboard/activities')
    return data.map((item) => ({
      ...item,
      time: formatActivityTime(item.time),
    }))
  },

  async getFinancialSummary(): Promise<FinancialSummaryItem[]> {
    const { data } = await api.get<FinanceiroResumo>('/financeiro/resumo')
    return buildFinancialSummaryFromResumo(data)
  },
}
