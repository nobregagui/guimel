/**
 * Contrato de API do módulo Financeiro — referência para implementação no backend NestJS.
 * Base URL: /api/financeiro
 */

import type {
  ContaBancaria,
  ContaPagar,
  ContaReceber,
  ExtratoMovimento,
  FormaPagamento,
  LancamentoStatus,
  Transferencia,
  TransferenciaStatus,
} from '@/features/financeiro/types'

// ─── Contas a Receber ─────────────────────────────────────────────────────────

/** POST /financeiro/contas-receber */
export type CreateContaReceberPayload = {
  clienteId?: string
  cliente: string
  categoria: string
  centroCusto?: string
  descricao?: string
  valor: number
  juros?: number
  multa?: number
  desconto?: number
  dataEmissaoIso: string
  vencimentoIso: string
  contaBancariaId?: string
  formaPagamento: FormaPagamento
  observacao?: string
  vendaId?: string
}

/** PATCH /financeiro/contas-receber/:id */
export type UpdateContaReceberPayload = Partial<CreateContaReceberPayload>

/** POST /financeiro/contas-receber/:id/receber */
export type ReceberContaPayload = {
  valorRecebido: number
  dataIso: string
  contaBancariaId: string
  juros?: number
  desconto?: number
  multa?: number
  observacao?: string
}

/** POST /financeiro/contas-receber/bulk */
export type BulkContasReceberPayload = {
  ids: string[]
  action: 'receber' | 'cancelar' | 'excluir' | 'alterar-categoria' | 'alterar-vencimento' | 'exportar'
  receber?: ReceberContaPayload
  categoria?: string
  vencimentoIso?: string
  formato?: 'csv' | 'xlsx' | 'pdf'
}

// ─── Contas a Pagar ───────────────────────────────────────────────────────────

/** POST /financeiro/contas-pagar */
export type CreateContaPagarPayload = {
  fornecedor: string
  documento?: string
  categoria: string
  centroCusto?: string
  descricao?: string
  valor: number
  juros?: number
  multa?: number
  desconto?: number
  dataEmissaoIso: string
  vencimentoIso: string
  contaBancariaId?: string
  formaPagamento: FormaPagamento
  observacao?: string
  modoLancamento?: 'unico' | 'recorrente'
  repeticoes?: number
}

/** PATCH /financeiro/contas-pagar/:id */
export type UpdateContaPagarPayload = Partial<CreateContaPagarPayload>

/** POST /financeiro/contas-pagar/:id/pagar */
export type PagarContaPayload = {
  valorPago: number
  dataIso: string
  contaBancariaId: string
  juros?: number
  desconto?: number
  multa?: number
  observacao?: string
}

/** POST /financeiro/contas-pagar/bulk */
export type BulkContasPagarPayload = {
  ids: string[]
  action: 'pagar' | 'cancelar' | 'excluir' | 'alterar-categoria' | 'alterar-centro-custo' | 'exportar'
  pagar?: PagarContaPayload
  categoria?: string
  centroCusto?: string
  formato?: 'csv' | 'xlsx' | 'pdf'
}

// ─── Extrato ──────────────────────────────────────────────────────────────────

/** GET /financeiro/extrato?contaId=&periodo=&... */
export type ExtratoListParams = {
  contaId?: string
  periodo?: '7d' | 'mes' | 'ano'
  categoria?: string
  tipo?: 'entrada' | 'saida' | 'todos'
  status?: 'conciliado' | 'pendente' | 'todos'
  valorMin?: number
  valorMax?: number
}

/** POST /financeiro/extrato */
export type CreateExtratoMovimentoPayload = {
  contaId: string
  dataIso: string
  descricao: string
  detalhe?: string
  categoria: string
  tipo: 'entrada' | 'saida'
  valor: number
  manual?: boolean
}

/** POST /financeiro/extrato/importar */
export type ImportarExtratoPayload = {
  contaId: string
  formato: 'ofx' | 'csv'
  arquivo: File | Blob
}

/** POST /financeiro/extrato/conciliar */
export type ConciliarExtratoPayload = {
  movimentoIds: string[]
}

/** POST /financeiro/extrato/desconciliar */
export type DesconciliarExtratoPayload = {
  movimentoIds: string[]
}

// ─── Transferências ───────────────────────────────────────────────────────────

/** POST /financeiro/transferencias */
export type CreateTransferenciaPayload = {
  contaOrigemId: string
  contaDestinoId: string
  dataIso: string
  valor: number
  descricao: string
  categoria?: string
  observacao?: string
  status?: TransferenciaStatus
}

/** PATCH /financeiro/transferencias/:id */
export type UpdateTransferenciaPayload = Partial<CreateTransferenciaPayload>

// ─── Contas bancárias ─────────────────────────────────────────────────────────

/** GET /financeiro/contas-bancarias */
export type ListContasBancariasResponse = ContaBancaria[]

/** POST /financeiro/contas-bancarias/:id/atualizar-saldo */
export type AtualizarSaldoContaPayload = {
  saldo: number
  dataReferenciaIso?: string
}

// ─── Exportação ───────────────────────────────────────────────────────────────

export type ExportFinanceiroPayload = {
  modulo: 'contas-receber' | 'contas-pagar' | 'extrato' | 'transferencias'
  formato: 'csv' | 'xlsx' | 'pdf'
  ids?: string[]
  filtros?: Record<string, string | number | boolean>
}

// ─── Respostas enriquecidas (detalhe) ─────────────────────────────────────────

export type TituloHistoricoItem = {
  id: string
  dataIso: string
  acao: string
  usuario: string
  detalhe?: string
}

export type TituloAnexo = {
  id: string
  nome: string
  tipo: 'pdf' | 'xml' | 'imagem' | 'contrato' | 'outro'
  url?: string
}

export type ContaReceberDetalhe = ContaReceber & {
  historico: TituloHistoricoItem[]
  parcelas: ContaReceber[]
  anexos: TituloAnexo[]
  pagamentos: Array<ReceberContaPayload & { id: string }>
}

export type ContaPagarDetalhe = ContaPagar & {
  historico: TituloHistoricoItem[]
  anexos: TituloAnexo[]
  pagamentos: Array<PagarContaPayload & { id: string }>
}

export type ExtratoMovimentoDetalhe = ExtratoMovimento & {
  conciliado: boolean
  historico: TituloHistoricoItem[]
}

export type TransferenciaDetalhe = Transferencia & {
  historico: TituloHistoricoItem[]
  anexos: TituloAnexo[]
}

/** Status estendidos para títulos */
export type TituloStatusApi = LancamentoStatus | 'parcial' | 'cancelado'
