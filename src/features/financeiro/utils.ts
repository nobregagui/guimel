import type {
  ContaPagar,
  ContaReceber,
  ContasPagarFiltro,
  ContasReceberFiltro,
  ContaTituloBase,
  ContasTituloTableFiltros,
  ExtratoContaFiltro,
  ExtratoFiltro,
  ExtratoMovimento,
  ExtratoTableFiltros,
  FinanceiroAba,
  FinanceiroDataFiltro,
  Lancamento,
  LancamentosTableFiltros,
  LancamentosVencimentoFiltro,
  LancamentoStatus,
  Periodo,
  Transferencia,
  TransferenciasFiltro,
  TransferenciasTableFiltros,
  TransferenciaStatus,
} from '@/features/financeiro/types'
import { FINANCEIRO_ABAS } from '@/features/financeiro/data/shared'

const REFERENCE_DATE = new Date('2026-06-15')

export type FinanceiroResumo = {
  aReceber: number
  recebido: number
  aPagar: number
  pago: number
  saldo: number
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

export function formatIsoToBR(iso: string): string {
  const [year, month, day] = iso.split('-')
  if (!year || !month || !day) return iso
  return `${day}/${month}/${year}`
}

export function addMonthsToIso(iso: string, months: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso

  const date = new Date(year, month - 1 + months, day)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatMesAnoReferencia(iso: string): string {
  const date = new Date(`${iso}T12:00:00`)
  const month = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')
  const year = String(date.getFullYear()).slice(-2)
  return `${month}/${year}`
}

export function descreverRecorrenciaContaPagar(repeticoes: number, vencimentoIso: string): string {
  const inicio = formatIsoToBR(vencimentoIso)
  if (repeticoes <= 1) {
    return `Será criado 1 título com vencimento em ${inicio}.`
  }

  const fim = formatIsoToBR(addMonthsToIso(vencimentoIso, repeticoes - 1))
  return `Serão criados ${repeticoes} títulos mensais (${inicio} a ${fim}), sempre no mesmo dia de cada mês.`
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

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase()
}

function matchesLancamentosDescricao(lancamento: Lancamento, descricao: string): boolean {
  const query = normalizeSearch(descricao)
  if (!query) return true

  return (
    lancamento.descricao.toLowerCase().includes(query) ||
    lancamento.subDescricao.toLowerCase().includes(query)
  )
}

function matchesLancamentosVencimentoFiltro(vencimentoIso: string, status: LancamentoStatus, filtro: LancamentosVencimentoFiltro): boolean {
  switch (filtro) {
    case 'mes_atual':
      return vencimentoIso.startsWith('2026-06')
    case 'ultimos_30': {
      const vencimento = new Date(`${vencimentoIso}T00:00:00`)
      const limit = new Date(REFERENCE_DATE)
      limit.setDate(limit.getDate() - 30)
      return vencimento >= limit && vencimento <= REFERENCE_DATE
    }
    case 'proximos_7':
      return isVencimentoProximo(vencimentoIso)
    case 'vencidos':
      return isVencido(vencimentoIso) && status !== 'pago'
    default:
      return true
  }
}

export function applyLancamentosTableFiltros(
  lancamentos: Lancamento[],
  filtros: LancamentosTableFiltros,
): Lancamento[] {
  return lancamentos.filter((lancamento) => {
    if (!matchesLancamentosDescricao(lancamento, filtros.descricao)) return false
    if (filtros.categoria && lancamento.categoria !== filtros.categoria) return false
    if (filtros.tipo !== 'todos' && lancamento.tipo !== filtros.tipo) return false
    if (filtros.status !== 'todos' && lancamento.status !== filtros.status) return false
    if (!matchesLancamentosVencimentoFiltro(lancamento.vencimentoIso, lancamento.status, filtros.vencimento)) {
      return false
    }
    return true
  })
}

export function countActiveLancamentosTableFiltros(filtros: LancamentosTableFiltros): number {
  let count = 0
  if (filtros.descricao.trim()) count += 1
  if (filtros.categoria) count += 1
  if (filtros.vencimento !== 'todos') count += 1
  if (filtros.tipo !== 'todos') count += 1
  if (filtros.status !== 'todos') count += 1
  return count
}

export function hasActiveLancamentosTableFiltros(filtros: LancamentosTableFiltros): boolean {
  return countActiveLancamentosTableFiltros(filtros) > 0
}

export function getRecentesTableLancamentos(
  lancamentos: Lancamento[],
  filtros: LancamentosTableFiltros,
): Lancamento[] {
  const filtered = applyLancamentosTableFiltros(lancamentos, filtros)
  const sorted = [...filtered].sort((a, b) => b.vencimentoIso.localeCompare(a.vencimentoIso))

  if (hasActiveLancamentosTableFiltros(filtros)) {
    return sorted
  }

  return sorted.slice(0, 5)
}

function matchesFinanceiroDataFiltro(dataIso: string, filtro: FinanceiroDataFiltro): boolean {
  switch (filtro) {
    case 'mes_atual':
      return dataIso.startsWith('2026-06')
    case 'ultimos_30': {
      const data = new Date(`${dataIso}T00:00:00`)
      const limit = new Date(REFERENCE_DATE)
      limit.setDate(limit.getDate() - 30)
      return data >= limit && data <= REFERENCE_DATE
    }
    case 'ultimos_7': {
      const data = new Date(`${dataIso}T00:00:00`)
      const limit = new Date(REFERENCE_DATE)
      limit.setDate(limit.getDate() - 7)
      return data >= limit && data <= REFERENCE_DATE
    }
    default:
      return true
  }
}

export function applyContasTituloTableFiltros<T extends ContaTituloBase & { documento: string }>(
  contas: T[],
  filtros: ContasTituloTableFiltros,
  getParteLabel: (conta: T) => string,
): T[] {
  return contas.filter((conta) => {
    const query = normalizeSearch(filtros.parte)
    if (query) {
      const searchable = `${getParteLabel(conta)} ${conta.documento}`.toLowerCase()
      if (!searchable.includes(query)) return false
    }
    if (filtros.categoria && conta.categoria !== filtros.categoria) return false
    if (filtros.formaPagamento && conta.formaPagamento !== filtros.formaPagamento) return false
    if (filtros.status !== 'todos' && conta.status !== filtros.status) return false
    if (!matchesLancamentosVencimentoFiltro(conta.vencimentoIso, conta.status, filtros.vencimento)) return false
    return true
  })
}

export function countActiveContasTituloTableFiltros(filtros: ContasTituloTableFiltros): number {
  let count = 0
  if (filtros.parte.trim()) count += 1
  if (filtros.categoria) count += 1
  if (filtros.vencimento !== 'todos') count += 1
  if (filtros.formaPagamento) count += 1
  if (filtros.status !== 'todos') count += 1
  return count
}

export function hasActiveContasTituloTableFiltros(filtros: ContasTituloTableFiltros): boolean {
  return countActiveContasTituloTableFiltros(filtros) > 0
}

export function getContasTituloTableItems<T extends ContaTituloBase & { documento: string }>(
  contas: T[],
  filtros: ContasTituloTableFiltros,
  getParteLabel: (conta: T) => string,
): T[] {
  const filtered = applyContasTituloTableFiltros(contas, filtros, getParteLabel)
  return [...filtered].sort((a, b) => b.vencimentoIso.localeCompare(a.vencimentoIso))
}

export function getExtratoBaseMovimentos(
  movimentos: ExtratoMovimento[],
  contaId: ExtratoContaFiltro,
  periodo: Periodo,
): ExtratoMovimento[] {
  return filterExtrato(movimentos, 'todos', contaId, periodo)
}

export function applyExtratoTableFiltros(
  movimentos: ExtratoMovimento[],
  filtros: ExtratoTableFiltros,
): ExtratoMovimento[] {
  return movimentos.filter((movimento) => {
    const query = normalizeSearch(filtros.descricao)
    if (query) {
      const searchable = `${movimento.descricao} ${movimento.detalhe}`.toLowerCase()
      if (!searchable.includes(query)) return false
    }
    if (filtros.categoria && movimento.categoria !== filtros.categoria) return false
    if (filtros.conta && movimento.contaId !== filtros.conta) return false
    if (filtros.tipo !== 'todos' && movimento.tipo !== filtros.tipo) return false
    if (!matchesFinanceiroDataFiltro(movimento.dataIso, filtros.data)) return false
    return true
  })
}

export function countActiveExtratoTableFiltros(filtros: ExtratoTableFiltros, showContaFilter: boolean): number {
  let count = 0
  if (filtros.descricao.trim()) count += 1
  if (filtros.categoria) count += 1
  if (showContaFilter && filtros.conta) count += 1
  if (filtros.tipo !== 'todos') count += 1
  if (filtros.data !== 'todos') count += 1
  return count
}

export function hasActiveExtratoTableFiltros(filtros: ExtratoTableFiltros, showContaFilter: boolean): boolean {
  return countActiveExtratoTableFiltros(filtros, showContaFilter) > 0
}

export function getExtratoTableMovimentos(
  movimentos: ExtratoMovimento[],
  filtros: ExtratoTableFiltros,
  contaId: ExtratoContaFiltro,
  periodo: Periodo,
): ExtratoMovimento[] {
  const base = getExtratoBaseMovimentos(movimentos, contaId, periodo)
  const filtered = applyExtratoTableFiltros(base, filtros)
  return [...filtered].sort((a, b) => b.dataIso.localeCompare(a.dataIso))
}

export function getTransferenciasBaseItems(
  transferencias: Transferencia[],
  contaId: ExtratoContaFiltro,
  periodo: Periodo,
): Transferencia[] {
  return filterTransferencias(transferencias, 'todos', contaId, periodo)
}

export function applyTransferenciasTableFiltros(
  transferencias: Transferencia[],
  filtros: TransferenciasTableFiltros,
): Transferencia[] {
  return transferencias.filter((transferencia) => {
    const query = normalizeSearch(filtros.descricao)
    if (query) {
      const searchable = `${transferencia.descricao} ${transferencia.observacao ?? ''}`.toLowerCase()
      if (!searchable.includes(query)) return false
    }
    if (filtros.status !== 'todos' && transferencia.status !== filtros.status) return false
    if (!matchesFinanceiroDataFiltro(transferencia.dataIso, filtros.data)) return false
    return true
  })
}

export function countActiveTransferenciasTableFiltros(filtros: TransferenciasTableFiltros): number {
  let count = 0
  if (filtros.descricao.trim()) count += 1
  if (filtros.data !== 'todos') count += 1
  if (filtros.status !== 'todos') count += 1
  return count
}

export function hasActiveTransferenciasTableFiltros(filtros: TransferenciasTableFiltros): boolean {
  return countActiveTransferenciasTableFiltros(filtros) > 0
}

export function getTransferenciasTableItems(
  transferencias: Transferencia[],
  filtros: TransferenciasTableFiltros,
  contaId: ExtratoContaFiltro,
  periodo: Periodo,
): Transferencia[] {
  const base = getTransferenciasBaseItems(transferencias, contaId, periodo)
  const filtered = applyTransferenciasTableFiltros(base, filtros)
  return [...filtered].sort((a, b) => b.dataIso.localeCompare(a.dataIso))
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
  return contas
    .filter((c) => c.status !== 'pago' && c.status !== 'cancelado')
    .reduce((acc, c) => acc + Math.max(0, c.valor - (c.valorBaixado ?? 0)), 0)
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

export function isFinanceiroAba(value: string | null): value is FinanceiroAba {
  return value !== null && FINANCEIRO_ABAS.some((aba) => aba.id === value)
}
