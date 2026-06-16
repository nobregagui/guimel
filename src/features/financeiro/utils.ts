import type {
  ContaPagar,
  ContaReceber,
  ContasPagarFiltro,
  ContasReceberFiltro,
  ContaTituloBase,
  ExtratoContaFiltro,
  ExtratoFiltro,
  ExtratoMovimento,
  Lancamento,
  LancamentoStatus,
  Periodo,
  Transferencia,
  TransferenciasFiltro,
  TransferenciaStatus,
} from '@/features/financeiro/types'

const REFERENCE_DATE = new Date('2026-06-15')

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export function isVencido(isoDate: string): boolean {
  return new Date(isoDate) < REFERENCE_DATE
}

export function isVencimentoProximo(isoDate: string, dias = 7): boolean {
  const vencimento = new Date(isoDate)
  const limite = new Date(REFERENCE_DATE)
  limite.setDate(limite.getDate() + dias)
  return vencimento >= REFERENCE_DATE && vencimento <= limite
}

export function filterLancamentos(lancamentos: Lancamento[], filtro: string): Lancamento[] {
  switch (filtro) {
    case 'receber':
      return lancamentos.filter((l) => l.tipo === 'receber')
    case 'pagar':
      return lancamentos.filter((l) => l.tipo === 'pagar')
    case 'vencidos':
      return lancamentos.filter((l) => l.status === 'vencido')
    default:
      return lancamentos
  }
}

export function filterContasPagar(contas: ContaPagar[], filtro: ContasPagarFiltro): ContaPagar[] {
  return filterContasTitulo(contas, filtro, 'pagas')
}

export function filterContasReceber(contas: ContaReceber[], filtro: ContasReceberFiltro): ContaReceber[] {
  return filterContasTitulo(contas, filtro, 'recebidas')
}

function filterContasTitulo<T extends ContaTituloBase>(
  contas: T[],
  filtro: string,
  concluidoKey: string,
): T[] {
  switch (filtro) {
    case 'pendentes':
      return contas.filter((c) => c.status === 'pendente')
    case 'vencidas':
      return contas.filter((c) => c.status === 'vencido')
    case concluidoKey:
      return contas.filter((c) => c.status === 'pago')
    default:
      return contas
  }
}

export function resolveStatusVisual(isoDate: string, status: LancamentoStatus): LancamentoStatus {
  if (status === 'pago') return 'pago'
  return isVencido(isoDate) ? 'vencido' : status
}

export function sumByStatus<T extends ContaTituloBase>(contas: T[], status: LancamentoStatus): number {
  return contas.filter((c) => c.status === status).reduce((acc, c) => acc + c.valor, 0)
}

export function sumEmAberto<T extends ContaTituloBase>(contas: T[]): number {
  return contas.filter((c) => c.status !== 'pago').reduce((acc, c) => acc + c.valor, 0)
}

export function groupByCategory<T extends ContaTituloBase>(contas: T[]): { categoria: string; total: number; quantidade: number }[] {
  const map = new Map<string, { total: number; quantidade: number }>()

  for (const conta of contas.filter((c) => c.status !== 'pago')) {
    const current = map.get(conta.categoria) ?? { total: 0, quantidade: 0 }
    map.set(conta.categoria, {
      total: current.total + conta.valor,
      quantidade: current.quantidade + 1,
    })
  }

  return [...map.entries()]
    .map(([categoria, data]) => ({ categoria, ...data }))
    .sort((a, b) => b.total - a.total)
}

export function getProximosTitulos<T extends ContaTituloBase>(contas: T[], limit = 4): T[] {
  return [...contas]
    .filter((c) => c.status !== 'pago')
    .sort((a, b) => a.vencimentoIso.localeCompare(b.vencimentoIso))
    .slice(0, limit)
}

export function getPeriodoLabel(periodo: string): string {
  if (periodo === '7d') return 'últimos 7 dias'
  if (periodo === 'mes') return 'junho'
  return '2026'
}

export const FORMA_PAGAMENTO_LABEL: Record<string, string> = {
  boleto: 'Boleto',
  pix: 'PIX',
  transferencia: 'Transferência',
  cartao: 'Cartão',
  debito: 'Débito',
}

export function filterByPeriodo<T extends { dataIso: string }>(items: T[], periodo: Periodo): T[] {
  if (periodo === '7d') {
    const inicio = new Date(REFERENCE_DATE)
    inicio.setDate(inicio.getDate() - 6)
    return items.filter((item) => {
      const data = new Date(item.dataIso)
      return data >= inicio && data <= REFERENCE_DATE
    })
  }

  if (periodo === 'mes') {
    return items.filter((item) => item.dataIso.startsWith('2026-06'))
  }

  return items.filter((item) => item.dataIso.startsWith('2026'))
}

export function filterExtrato(
  movimentos: ExtratoMovimento[],
  filtro: ExtratoFiltro,
  contaId: ExtratoContaFiltro,
  periodo: Periodo,
): ExtratoMovimento[] {
  let result = filterByPeriodo(movimentos, periodo)

  if (contaId !== 'todas') {
    result = result.filter((m) => m.contaId === contaId)
  }

  if (filtro === 'entradas') {
    result = result.filter((m) => m.tipo === 'entrada')
  }

  if (filtro === 'saidas') {
    result = result.filter((m) => m.tipo === 'saida')
  }

  return [...result].sort((a, b) => b.dataIso.localeCompare(a.dataIso))
}

export function sumExtratoPorTipo(movimentos: ExtratoMovimento[], tipo: ExtratoMovimento['tipo']): number {
  return movimentos.filter((m) => m.tipo === tipo).reduce((acc, m) => acc + m.valor, 0)
}

export interface ExtratoResumoFinanceiro {
  entradas: number
  saidas: number
  liquido: number
  quantidade: number
  saldoAtual: number
}

export function buildExtratoResumo(
  movimentos: ExtratoMovimento[],
  saldoAtual: number,
): ExtratoResumoFinanceiro {
  const entradas = sumExtratoPorTipo(movimentos, 'entrada')
  const saidas = sumExtratoPorTipo(movimentos, 'saida')

  return {
    entradas,
    saidas,
    liquido: entradas - saidas,
    quantidade: movimentos.length,
    saldoAtual,
  }
}

const TRANSFERENCIA_STATUS_MAP: Record<TransferenciasFiltro, TransferenciaStatus | null> = {
  todos: null,
  concluidas: 'concluida',
  agendadas: 'agendada',
  canceladas: 'cancelada',
}

export function filterTransferencias(
  transferencias: Transferencia[],
  filtro: TransferenciasFiltro,
  contaId: ExtratoContaFiltro,
  periodo: Periodo,
): Transferencia[] {
  let result = filterByPeriodo(transferencias, periodo)

  if (contaId !== 'todas') {
    result = result.filter((t) => t.contaOrigemId === contaId || t.contaDestinoId === contaId)
  }

  const statusAlvo = TRANSFERENCIA_STATUS_MAP[filtro]
  if (statusAlvo) {
    result = result.filter((t) => t.status === statusAlvo)
  }

  return [...result].sort((a, b) => b.dataIso.localeCompare(a.dataIso))
}

export function sumTransferenciasPorStatus(
  transferencias: Transferencia[],
  status: TransferenciaStatus,
): number {
  return transferencias.filter((t) => t.status === status).reduce((acc, t) => acc + t.valor, 0)
}

export function getProximasTransferencias(transferencias: Transferencia[], limit = 4): Transferencia[] {
  return [...transferencias]
    .filter((t) => t.status === 'agendada')
    .sort((a, b) => a.dataIso.localeCompare(b.dataIso))
    .slice(0, limit)
}

export interface TransferenciaContaResumo {
  contaId: string
  entradas: number
  saidas: number
  liquido: number
  quantidade: number
}

export function getTransferenciaResumoPorConta(
  transferencias: Transferencia[],
  contaIds: string[],
): TransferenciaContaResumo[] {
  return contaIds.map((contaId) => {
    let entradas = 0
    let saidas = 0
    let quantidade = 0

    for (const transferencia of transferencias) {
      if (transferencia.status === 'cancelada') continue

      if (transferencia.contaDestinoId === contaId) {
        entradas += transferencia.valor
        quantidade += 1
      }

      if (transferencia.contaOrigemId === contaId) {
        saidas += transferencia.valor
        quantidade += 1
      }
    }

    return {
      contaId,
      entradas,
      saidas,
      liquido: entradas - saidas,
      quantidade,
    }
  })
}
