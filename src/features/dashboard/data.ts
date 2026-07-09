import type {
  CashflowPeriod,
  CashflowSeries,
  DashboardKpiItem,
  DashboardNotification,
  FinancialSummaryItem,
  GlobalSearchItem,
  QuickActionItem,
  ReceivableItem,
  RecentActivityItem,
  SidebarNavItem,
} from '@/features/dashboard/types'
import { APP_PATHS } from '@/routes/paths'
import { ROUTE_ACCESS_PERMISSIONS } from '@/constants/permissions'
import { ROUTE_QUERY, buildRoutePath } from '@/routes/queryState'

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
  {
    id: 'venda',
    label: 'Nova venda',
    to: buildRoutePath(APP_PATHS.vendas, { [ROUTE_QUERY.intent]: 'nova' }),
    permissions: ['vendas:write', 'vendas:write:own', 'vendas:write:team'],
  },
  {
    id: 'cobranca',
    label: 'Nova cobrança',
    to: buildRoutePath(APP_PATHS.financeiro, {
      [ROUTE_QUERY.tab]: 'a-receber',
      [ROUTE_QUERY.intent]: 'nova',
    }),
    permissions: ['contas_receber:write', 'financeiro:write', 'financeiro:*'],
  },
  {
    id: 'pagamento',
    label: 'Novo pagamento',
    to: buildRoutePath(APP_PATHS.financeiro, {
      [ROUTE_QUERY.tab]: 'a-pagar',
      [ROUTE_QUERY.intent]: 'nova',
    }),
    permissions: ['contas_pagar:write', 'financeiro:write', 'financeiro:*'],
  },
  {
    id: 'nf',
    label: 'Emitir nota fiscal',
    to: buildRoutePath(APP_PATHS.notasFiscais, {
      [ROUTE_QUERY.intent]: 'nova',
      [ROUTE_QUERY.tipo]: 'saida',
    }),
    permissions: ['nfe:write', 'nfe:export'],
  },
]

export const sidebarNavItems: SidebarNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', to: APP_PATHS.dashboard, icon: 'dashboard', permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.dashboard] },
  { id: 'financeiro', label: 'Financeiro', to: APP_PATHS.financeiro, icon: 'financeiro', permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.financeiro] },
  { id: 'vendas', label: 'Vendas', to: APP_PATHS.vendas, icon: 'vendas', permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.vendas] },
  { id: 'clientes', label: 'Clientes', to: APP_PATHS.clientes, icon: 'clientes', permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.clientes] },
  { id: 'produtos', label: 'Produtos', to: APP_PATHS.produtos, icon: 'produtos', permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.produtos] },
  { id: 'notas', label: 'Notas Fiscais', to: APP_PATHS.notasFiscais, icon: 'notas', permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.notasFiscais] },
  { id: 'relatorios', label: 'Relatórios', to: APP_PATHS.relatorios, icon: 'relatorios', permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.relatorios] },
  { id: 'cobrancas', label: 'Cobranças', to: APP_PATHS.cobrancas, icon: 'cobrancas', permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.cobrancas] },
  { id: 'integracoes', label: 'Integrações', to: APP_PATHS.integracoes, icon: 'integracoes', permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.integracoes] },
  { id: 'conciliacao', label: 'Conciliação', to: APP_PATHS.conciliacaoBancaria, icon: 'conciliacao', permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.conciliacaoBancaria] },
  { id: 'configuracoes', label: 'Configurações', to: APP_PATHS.configuracoes, icon: 'configuracoes', permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.configuracoes] },
]

export const globalSearchItems: GlobalSearchItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Resumo financeiro da empresa',
    to: APP_PATHS.dashboard,
    keywords: ['dashboard', 'inicio', 'resumo', 'home'],
    permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.dashboard],
  },
  {
    id: 'clientes',
    label: 'Clientes',
    description: 'Cadastro e análise de clientes',
    to: APP_PATHS.clientes,
    keywords: ['clientes', 'cliente', 'cadastro'],
    passBusca: true,
    permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.clientes],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    description: 'Visão geral financeira',
    to: APP_PATHS.financeiro,
    keywords: ['financeiro', 'fluxo', 'caixa', 'extrato'],
    permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.financeiro],
  },
  {
    id: 'financeiro-receber',
    label: 'Contas a receber',
    description: 'Financeiro · títulos a receber',
    to: buildRoutePath(APP_PATHS.financeiro, { [ROUTE_QUERY.tab]: 'a-receber' }),
    keywords: ['receber', 'recebiveis', 'cobranca', 'titulos'],
    permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.financeiro],
  },
  {
    id: 'financeiro-pagar',
    label: 'Contas a pagar',
    description: 'Financeiro · títulos a pagar',
    to: buildRoutePath(APP_PATHS.financeiro, { [ROUTE_QUERY.tab]: 'a-pagar' }),
    keywords: ['pagar', 'despesas', 'fornecedor'],
    permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.financeiro],
  },
  {
    id: 'vendas',
    label: 'Vendas',
    description: 'Pedidos e orçamentos',
    to: APP_PATHS.vendas,
    keywords: ['vendas', 'pedido', 'orcamento'],
    passBusca: true,
    permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.vendas],
  },
  {
    id: 'produtos',
    label: 'Produtos',
    description: 'Catálogo de produtos',
    to: APP_PATHS.produtos,
    keywords: ['produtos', 'produto', 'estoque', 'catalogo'],
    permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.produtos],
  },
  {
    id: 'notas',
    label: 'Notas fiscais',
    description: 'Emissão e gestão de NF-e',
    to: APP_PATHS.notasFiscais,
    keywords: ['nota', 'nfe', 'fiscal', 'nf-e'],
    permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.notasFiscais],
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    description: 'Análises e exportações',
    to: APP_PATHS.relatorios,
    keywords: ['relatorio', 'relatorios', 'exportar'],
    permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.relatorios],
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    description: 'Perfil e preferências',
    to: APP_PATHS.configuracoes,
    keywords: ['configuracoes', 'configuracao', 'perfil', 'conta'],
    permissions: ROUTE_ACCESS_PERMISSIONS[APP_PATHS.configuracoes],
  },
]

export const dashboardNotifications: DashboardNotification[] = [
  {
    id: 'n1',
    title: 'Conta a vencer',
    message: 'Cliente Exemplo LTDA vence em 3 dias — R$ 12.450,00',
    time: 'Há 2 h',
    read: false,
  },
  {
    id: 'n2',
    title: 'Pagamento recebido',
    message: 'Mercado Exemplo confirmou pagamento de R$ 8.320,00',
    time: 'Há 5 h',
    read: false,
  },
  {
    id: 'n3',
    title: 'NF-e autorizada',
    message: 'Nota fiscal 00142 emitida com sucesso',
    time: 'Ontem',
    read: true,
  },
]

/** Pontos normalizados 0–1 para mini gráficos e fluxo de caixa (mock). */
export const CASHFLOW_PERIOD_OPTIONS: { id: CashflowPeriod; label: string }[] = [
  { id: '7d', label: 'Últimos 7 dias' },
  { id: 'mes', label: 'Mês atual' },
  { id: 'ano', label: 'Ano 2026' },
]

export const cashflowChartByPeriod: Record<CashflowPeriod, CashflowSeries> = {
  '7d': {
    entradas: [0.52, 0.48, 0.61, 0.55, 0.68, 0.72, 0.78],
    saidas: [0.44, 0.5, 0.46, 0.52, 0.48, 0.55, 0.51],
    saldo: [0.46, 0.44, 0.5, 0.48, 0.54, 0.56, 0.6],
    labels: ['09', '10', '11', '12', '13', '14', '15'],
  },
  mes: {
    entradas: [0.42, 0.55, 0.48, 0.62, 0.58, 0.72, 0.68, 0.78, 0.74, 0.85, 0.8, 0.92],
    saidas: [0.38, 0.45, 0.52, 0.48, 0.55, 0.5, 0.58, 0.54, 0.6, 0.56, 0.62, 0.58],
    saldo: [0.35, 0.4, 0.38, 0.45, 0.42, 0.5, 0.48, 0.55, 0.52, 0.6, 0.58, 0.65],
    labels: ['01', '05', '09', '12', '15', '19', '23', '26', '28', '01', '05', '09'],
  },
  ano: {
    entradas: [0.35, 0.42, 0.48, 0.52, 0.58, 0.65, 0.62, 0.7, 0.68, 0.75, 0.82, 0.88],
    saidas: [0.32, 0.38, 0.44, 0.46, 0.5, 0.54, 0.52, 0.56, 0.55, 0.58, 0.6, 0.62],
    saldo: [0.28, 0.32, 0.36, 0.4, 0.44, 0.48, 0.46, 0.52, 0.5, 0.55, 0.6, 0.65],
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  },
}

/** @deprecated Use cashflowChartByPeriod */
export const cashflowChartData = cashflowChartByPeriod.mes
