import type { ReactNode } from 'react'

export type LancamentoStatus = 'pago' | 'pendente' | 'vencido' | 'parcial' | 'cancelado'
export type LancamentoTipo = 'receber' | 'pagar'
export type Periodo = '7d' | 'mes' | 'ano'
export type FinanceiroAba = 'visao-geral' | 'a-pagar' | 'a-receber' | 'extrato' | 'transferencias'
export type FiltroLancamento = 'todos' | 'receber' | 'pagar' | 'vencidos'
export type LancamentosVencimentoFiltro = 'todos' | 'mes_atual' | 'ultimos_30' | 'proximos_7' | 'vencidos'
export type LancamentosTipoFiltro = 'todos' | LancamentoTipo
export type LancamentosStatusFiltro = 'todos' | LancamentoStatus

export interface LancamentosTableFiltros {
  descricao: string
  categoria: string
  vencimento: LancamentosVencimentoFiltro
  tipo: LancamentosTipoFiltro
  status: LancamentosStatusFiltro
}

export type FinanceiroDataFiltro = 'todos' | 'mes_atual' | 'ultimos_30' | 'ultimos_7'
export type ExtratoTipoTableFiltro = 'todos' | ExtratoMovimentoTipo
export type TransferenciasStatusTableFiltro = 'todos' | TransferenciaStatus

export interface ContasTituloTableFiltros {
  parte: string
  categoria: string
  vencimento: LancamentosVencimentoFiltro
  formaPagamento: '' | FormaPagamento
  status: LancamentosStatusFiltro
}

export interface ExtratoTableFiltros {
  descricao: string
  categoria: string
  conta: string
  tipo: ExtratoTipoTableFiltro
  data: FinanceiroDataFiltro
}

export interface TransferenciasTableFiltros {
  descricao: string
  data: FinanceiroDataFiltro
  status: TransferenciasStatusTableFiltro
}
export type ContasPagarFiltro = 'todos' | 'pendentes' | 'vencidas' | 'pagas'
export type ContasReceberFiltro = 'todos' | 'pendentes' | 'vencidas' | 'recebidas'
export type ExtratoFiltro = 'todos' | 'entradas' | 'saidas'
export type ExtratoContaFiltro = 'todas' | string
export type ExtratoMovimentoTipo = 'entrada' | 'saida'
export type TransferenciaStatus = 'concluida' | 'agendada' | 'cancelada' | 'pendente' | 'falhou'
export type TransferenciasFiltro = 'todos' | 'concluidas' | 'agendadas' | 'canceladas'
export type FormaPagamento = 'boleto' | 'pix' | 'transferencia' | 'cartao' | 'debito'
export type ModoLancamentoContaPagar = 'unico' | 'recorrente'
export type TipoCustoPagar = 'fixo' | 'variavel'

export interface OpcaoRepeticaoContaPagar {
  vezes: number
  label: string
  descricao: string
}

export const OPCOES_REPETICAO_CONTA_PAGAR: OpcaoRepeticaoContaPagar[] = [
  { vezes: 2, label: '2×', descricao: 'Repetir por 2 meses' },
  { vezes: 3, label: '3×', descricao: 'Repetir por 3 meses' },
  { vezes: 6, label: '6×', descricao: 'Repetir por 6 meses' },
  { vezes: 12, label: '12×', descricao: 'Todo mês · 1 ano' },
]

export interface ContaTituloBase {
  id: string
  categoria: string
  centroCusto?: string
  descricao?: string
  vencimento: string
  vencimentoIso: string
  dataEmissaoIso?: string
  valor: number
  valorBaixado?: number
  juros?: number
  multa?: number
  desconto?: number
  formaPagamento: FormaPagamento
  contaBancariaId?: string
  status: LancamentoStatus
  observacao?: string
  vendaId?: string
  criadoEmIso?: string
}

export interface ContaPagar extends ContaTituloBase {
  fornecedor: string
  documento: string
  modoLancamento: ModoLancamentoContaPagar
  tipoCusto: TipoCustoPagar
  recorrenciaId?: string | null
  recorrenciaParcela?: number | null
  recorrenciaTotal?: number | null
}

export interface ContaReceber extends ContaTituloBase {
  cliente: string
  documento: string
}

export interface Lancamento {
  id: string
  descricao: string
  subDescricao: string
  categoria: string
  vencimento: string
  vencimentoIso: string
  tipo: LancamentoTipo
  valor: number
  status: LancamentoStatus
}

export interface ContaBancaria {
  id: string
  nome: string
  banco: 'itau' | 'bradesco' | 'nubank' | 'caixa'
  saldo: number
}

export interface ExtratoMovimento {
  id: string
  contaId: string
  data: string
  dataIso: string
  descricao: string
  detalhe: string
  categoria: string
  tipo: ExtratoMovimentoTipo
  valor: number
  saldoApos: number
  conciliado?: boolean
  manual?: boolean
}

export interface Transferencia {
  id: string
  contaOrigemId: string
  contaDestinoId: string
  data: string
  dataIso: string
  descricao: string
  observacao?: string
  valor: number
  status: TransferenciaStatus
}

export interface FluxoPonto {
  label: string
  entradas: number
  saidas: number
  projecao?: boolean
}

export interface LancamentoFormValues {
  descricao: string
  subDescricao: string
  categoria: string
  tipo: LancamentoTipo
  vencimentoIso: string
  valor: number
  status: LancamentoStatus
}

export interface ContaPagarFormValues {
  fornecedor: string
  documento: string
  categoria: string
  vencimentoIso: string
  valor: number
  formaPagamento: FormaPagamento
  status: LancamentoStatus
  modoLancamento: ModoLancamentoContaPagar
  tipoCusto: TipoCustoPagar
  repeticoes: number
}

export interface ContaReceberFormValues {
  cliente: string
  documento: string
  categoria: string
  centroCusto?: string
  descricao?: string
  dataEmissaoIso: string
  vencimentoIso: string
  valor: number
  juros?: number
  multa?: number
  desconto?: number
  formaPagamento: FormaPagamento
  contaBancariaId?: string
  status: LancamentoStatus
  observacao?: string
}

export interface BaixaTituloFormValues {
  valor: number
  dataIso: string
  contaBancariaId: string
  juros: number
  desconto: number
  multa: number
  observacao: string
}

export type TituloModulo = 'receber' | 'pagar'

export type FinanceiroExportFormato = 'csv' | 'xlsx' | 'pdf'

export type FinanceiroToolbarAction = 'novo' | 'importar' | 'exportar' | 'atualizar' | 'filtros' | 'colunas' | 'relatorios'

export interface ExtratoMovimentoFormValues {
  contaId: string
  dataIso: string
  descricao: string
  detalhe: string
  categoria: string
  tipo: ExtratoMovimentoTipo
  valor: number
}

export interface TransferenciaFormValues {
  contaOrigemId: string
  contaDestinoId: string
  dataIso: string
  descricao: string
  observacao: string
  valor: number
  status: TransferenciaStatus
}

export interface FilterOption<T extends string = string> {
  id: T
  label: string
}

export interface KpiMetric {
  id: string
  label: string
  value: string
  trend?: string
  trendPositive?: boolean
  progress: number
  progressColor: string
  colorClass: string
}

export interface CategorySummary {
  categoria: string
  total: number
  quantidade: number
  percentual: number
}

export interface TableColumn<T> {
  key: string
  header: string
  align?: 'left' | 'right' | 'center'
  headerClassName?: string
  cellClassName?: string
  render: (row: T) => ReactNode
}
