import { useQuery } from '@tanstack/react-query'

import { dashboardService } from '@/services/dashboard.service'
import type { CashflowPeriod } from '@/features/dashboard/types'

export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  kpis: () => [...dashboardQueryKeys.all, 'kpis'] as const,
  cashflow: (periodo: CashflowPeriod) => [...dashboardQueryKeys.all, 'cashflow', periodo] as const,
  receivables: () => [...dashboardQueryKeys.all, 'receivables'] as const,
  activities: () => [...dashboardQueryKeys.all, 'activities'] as const,
  financialSummary: () => [...dashboardQueryKeys.all, 'financial-summary'] as const,
}

export function useDashboardKpisQuery() {
  return useQuery({
    queryKey: dashboardQueryKeys.kpis(),
    queryFn: () => dashboardService.getKpis(),
  })
}

export function useDashboardCashflowQuery(periodo: CashflowPeriod) {
  return useQuery({
    queryKey: dashboardQueryKeys.cashflow(periodo),
    queryFn: () => dashboardService.getCashflow(periodo),
  })
}

export function useDashboardReceivablesQuery() {
  return useQuery({
    queryKey: dashboardQueryKeys.receivables(),
    queryFn: () => dashboardService.getReceivables(),
  })
}

export function useDashboardActivitiesQuery() {
  return useQuery({
    queryKey: dashboardQueryKeys.activities(),
    queryFn: () => dashboardService.getActivities(),
  })
}

export function useDashboardFinancialSummaryQuery() {
  return useQuery({
    queryKey: dashboardQueryKeys.financialSummary(),
    queryFn: () => dashboardService.getFinancialSummary(),
  })
}
