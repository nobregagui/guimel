import type {
  DashboardKpiItem,
  FinancialSummaryItem,
  QuickActionItem,
  ReceivableItem,
  RecentActivityItem,
  SidebarNavItem,
} from '@/features/dashboard/types'

export const dashboardKpiItems: DashboardKpiItem[] = [
  { id: 'faturamento', label: 'Faturamento', value: 125_430, change: 20.5, changeLabel: '+20,5%' },
  { id: 'receber', label: 'Contas a Receber', value: 87_650, change: 15.3, changeLabel: '+15,3%' },
  { id: 'pagar', label: 'Contas a Pagar', value: 23_480, change: -8.7, changeLabel: '-8,7%' },
  { id: 'saldo', label: 'Saldo Disponível', value: 42_890, change: 12.1, changeLabel: '+12,1%' },
]

export const financialSummaryItems: FinancialSummaryItem[] = [
  { id: 'entradas', label: 'Entradas', value: 158_250 },
  { id: 'saidas', label: 'Saídas', value: 96_820 },
  { id: 'resultado', label: 'Resultado', value: 61_430 },
  { id: 'margem', label: 'Margem', value: 38.8, isPercent: true },
]

export const receivableItems: ReceivableItem[] = [
  { id: '1', client: 'Cliente Exemplo LTDA', dueDate: '05/06/2026', amount: 12_450 },
  { id: '2', client: 'Mercado Exemplo', dueDate: '08/06/2026', amount: 8_320 },
  { id: '3', client: 'Loja Exemplo', dueDate: '10/06/2026', amount: 5_890 },
  { id: '4', client: 'Empresa Exemplo ME', dueDate: '12/06/2026', amount: 18_200 },
  { id: '5', client: 'Distribuidora Exemplo', dueDate: '15/06/2026', amount: 22_750 },
]

export const recentActivityItems: RecentActivityItem[] = [
  { id: '1', description: 'Venda realizada', amount: 4_850, time: 'Há 12 min', type: 'sale' },
  { id: '2', description: 'Conta a pagar registrada', amount: -2_340, time: 'Há 45 min', type: 'payable' },
  { id: '3', description: 'Pagamento recebido', amount: 9_120, time: 'Há 1 h', type: 'payment' },
  { id: '4', description: 'Nota fiscal emitida', amount: 7_600, time: 'Há 2 h', type: 'invoice' },
]

export const quickActionItems: QuickActionItem[] = [
  { id: 'venda', label: 'Nova venda' },
  { id: 'cobranca', label: 'Nova cobrança' },
  { id: 'pagamento', label: 'Novo pagamento' },
  { id: 'nf', label: 'Emitir nota fiscal' },
]

export const sidebarNavItems: SidebarNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
  { id: 'financeiro', label: 'Financeiro', to: '/financeiro', icon: 'financeiro' },
  { id: 'vendas', label: 'Vendas', to: '/vendas', icon: 'vendas' },
  { id: 'clientes', label: 'Clientes', to: '/clientes', icon: 'clientes' },
  { id: 'produtos', label: 'Produtos', to: '/produtos', icon: 'produtos' },
  { id: 'notas', label: 'Notas Fiscais', to: '/notas-fiscais', icon: 'notas' },
  { id: 'relatorios', label: 'Relatórios', to: '/relatorios', icon: 'relatorios' },
  { id: 'cobrancas', label: 'Cobranças', to: '/cobrancas', icon: 'cobrancas' },
  { id: 'integracoes', label: 'Integrações', to: '/integracoes', icon: 'integracoes' },
  { id: 'configuracoes', label: 'Configurações', to: '/configuracoes', icon: 'configuracoes' },
]

/** Pontos normalizados 0–1 para mini gráficos e fluxo de caixa (mock). */
export const cashflowChartData = {
  entradas: [0.42, 0.55, 0.48, 0.62, 0.58, 0.72, 0.68, 0.78, 0.74, 0.85, 0.8, 0.92],
  saidas: [0.38, 0.45, 0.52, 0.48, 0.55, 0.5, 0.58, 0.54, 0.6, 0.56, 0.62, 0.58],
  saldo: [0.35, 0.4, 0.38, 0.45, 0.42, 0.5, 0.48, 0.55, 0.52, 0.6, 0.58, 0.65],
}
