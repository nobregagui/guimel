import { FilterPills } from '@/features/financeiro/components/FinanceiroKpiCard'
import type { ContaBancaria, ExtratoContaFiltro } from '@/features/financeiro/types'

interface ContaSelectorProps {
  contas: ContaBancaria[]
  value: ExtratoContaFiltro
  onChange: (contaId: ExtratoContaFiltro) => void
}

export function ContaSelector({ contas, value, onChange }: ContaSelectorProps) {
  const options = [
    { id: 'todas' as const, label: 'Todas as contas' },
    ...contas.map((conta) => ({ id: conta.id, label: conta.nome })),
  ]

  return <FilterPills options={options} value={value} onChange={onChange} />
}
