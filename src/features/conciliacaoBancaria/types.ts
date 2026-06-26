import type { ReactNode } from 'react'

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export type ConciliacaoAba = 'dashboard' | 'conciliacao' | 'regras' | 'analytics' | 'historico'

// ─── Primitive unions ─────────────────────────────────────────────────────────
export type ExtratoOrigemTipo =
  | 'pix'
  | 'ted'
  | 'doc'
  | 'boleto'
  | 'cartao'
  | 'tarifa'
  | 'iof'
  | 'juros'
  | 'transferencia'
  | 'aplicacao'
  | 'resgate'
  | 'cheque'
  | 'outros'

export type ExtratoItemStatus = 'pendente' | 'conciliado' | 'ignorado' | 'sugerido'
export type ExtratoMovTipo = 'credito' | 'debito'
export type ErpLancTipo = 'receber' | 'pagar'
export type ErpLancStatus = 'pendente' | 'conciliado' | 'pago'
export type ConciliacaoTipo = 'manual' | 'automatica' | 'sugerida'
export type RegraAplicadaA = 'receber' | 'pagar' | 'ambos'
export type BancoId = 'itau' | 'bradesco' | 'nubank' | 'caixa' | 'santander' | 'inter' | 'sicoob' | 'safra'
export type ConciliacaoHistoricoEvento =
  | 'importado'
  | 'sugerido'
  | 'conciliado'
  | 'editado'
  | 'desfeito'
  | 'ignorado'
  | 'aprovado'

// ─── Domain entities ──────────────────────────────────────────────────────────
export interface ContaConciliacao {
  id: string
  nome: string
  banco: BancoId
  agencia: string
  conta: string
  saldo: number
  saldoErp: number
}

export interface ExtratoItem {
  id: string
  contaId: string
  data: string
  dataIso: string
  descricao: string
  documento?: string
  valor: number
  tipo: ExtratoMovTipo
  saldo: number
  origem: ExtratoOrigemTipo
  status: ExtratoItemStatus
  lancamentoErpId?: string
  conciliacaoId?: string
  importadoEm: string
  observacao?: string
}

export interface ErpLancamento {
  id: string
  tipo: ErpLancTipo
  descricao: string
  cliente?: string
  fornecedor?: string
  documento?: string
  categoria: string
  centroCusto?: string
  competencia: string
  competenciaIso: string
  vencimento: string
  vencimentoIso: string
  valor: number
  status: ErpLancStatus
  extratoItemId?: string
  conciliacaoId?: string
  observacao?: string
}

export interface ConciliacaoRegistro {
  id: string
  /** @deprecated use extratoIds */
  extratoItemId: string
  /** @deprecated use erpIds */
  erpLancamentoId: string
  /** N:N support — IDs of extrato items involved */
  extratoIds: string[]
  /** N:N support — IDs of ERP lancamentos involved */
  erpIds: string[]
  tipo: ConciliacaoTipo
  score?: number
  criadoEm: string
  criadoEmIso: string
  criadoPor: string
  observacao?: string
  historico: ConciliacaoHistoricoItem[]
}

export interface ConciliacaoHistoricoItem {
  evento: ConciliacaoHistoricoEvento
  descricao: string
  em: string
  emIso: string
  por: string
}

export interface RegraAutomatica {
  id: string
  nome: string
  descricao: string
  ativo: boolean
  origens: ExtratoOrigemTipo[]
  palavrasChave: string[]
  categoria?: string
  centroCusto?: string
  tipo: RegraAplicadaA
  aplicacoes: number
  criadaEm: string
  prioridade: number
}

export interface SugestaoScore {
  extratoItemId: string
  erpLancamentoId: string
  score: number
  criterios: SugestaoCriterio[]
}

export interface SugestaoCriterio {
  nome: string
  peso: number
  match: boolean
  descricao: string
}

// ─── Filters ─────────────────────────────────────────────────────────────────
export type ExtratoFiltroData = 'todos' | 'hoje' | 'semana' | 'mes' | 'mes_anterior'
export type ErpFiltroData = 'todos' | 'mes_atual' | 'mes_anterior' | 'ultimos_30' | 'proximos_7'

export interface ExtratoTableFiltros {
  busca: string
  contaId: string
  origem: ExtratoOrigemTipo | 'todos'
  tipo: ExtratoMovTipo | 'todos'
  status: ExtratoItemStatus | 'todos'
  data: ExtratoFiltroData
  valorMin: string
  valorMax: string
}

export interface ErpTableFiltros {
  busca: string
  tipo: ErpLancTipo | 'todos'
  status: ErpLancStatus | 'todos'
  categoria: string
  centroCusto: string
  data: ErpFiltroData
  valorMin: string
  valorMax: string
}

// ─── Generic table ────────────────────────────────────────────────────────────
export interface TableColumn<T> {
  key: string
  header: string
  align?: 'left' | 'right' | 'center'
  headerClassName?: string
  cellClassName?: string
  render: (row: T) => ReactNode
}

// ─── Dashboard analytics ─────────────────────────────────────────────────────
export interface ConciliacaoKpiItem {
  id: string
  label: string
  value: string
  subValue?: string
  trend?: string
  trendPositive?: boolean
  progress?: number
  progressColor?: string
  colorClass?: string
}

export interface AnalyticsChartPoint {
  label: string
  conciliadas: number
  pendentes: number
  automaticas: number
}
