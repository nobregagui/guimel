export interface DashboardKpiItem {
  id: string
  label: string
  value: number
  change: number
  changeLabel: string
}

export interface ReceivableItem {
  id: string
  client: string
  dueDate: string
  amount: number
}

export interface RecentActivityItem {
  id: string
  description: string
  amount: number
  time: string
  type: 'sale' | 'payable' | 'payment' | 'invoice'
}

export type QuickActionId = 'venda' | 'cobranca' | 'pagamento' | 'nf'

export interface QuickActionItem {
  id: QuickActionId
  label: string
  to: string
}

export interface FinancialSummaryItem {
  id: string
  label: string
  value: number
  isPercent?: boolean
}

export interface SidebarNavItem {
  id: string
  label: string
  to: string
  icon: 'dashboard' | 'financeiro' | 'vendas' | 'clientes' | 'produtos' | 'notas' | 'relatorios' | 'conciliacao' | 'cobrancas' | 'integracoes' | 'configuracoes'
}

export interface GlobalSearchItem {
  id: string
  label: string
  description: string
  to: string
  keywords: string[]
  passBusca?: boolean
}

export interface DashboardNotification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
}

export type CashflowPeriod = '7d' | 'mes' | 'ano'

export interface CashflowSeries {
  entradas: number[]
  saidas: number[]
  saldo: number[]
  labels: string[]
}

export type CashflowSeriesKey = 'entradas' | 'saidas' | 'saldo'
