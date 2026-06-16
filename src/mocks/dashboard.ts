export interface DashboardKpi {
  id: string
  label: string
  value: number
}

export const dashboardKpis: DashboardKpi[] = [
  { id: 'receita-mensal', label: 'Receita Mensal', value: 128500.75 },
  { id: 'contas-receber', label: 'Contas a Receber', value: 48200.15 },
  { id: 'contas-pagar', label: 'Contas a Pagar', value: 31980.4 },
  { id: 'clientes-ativos', label: 'Clientes Ativos', value: 247 },
]
