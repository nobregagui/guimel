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

export interface QuickActionItem {
  id: string
  label: string
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
  icon: 'dashboard' | 'financeiro' | 'vendas' | 'clientes' | 'produtos' | 'notas' | 'relatorios' | 'cobrancas' | 'integracoes' | 'configuracoes'
}
