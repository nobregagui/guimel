import type { ReactNode } from 'react'

export type ClienteTipo = 'pf' | 'pj'
export type ClienteStatus = 'ativo' | 'inativo' | 'pendente'
export type ClienteFormaPagamento = 'boleto' | 'pix' | 'transferencia' | 'cartao' | 'debito'
export type ClienteFiltro = 'todos' | 'ativos' | 'inativos' | 'pendentes'
export type ClientesAba = 'visao-geral' | 'clientes' | 'analise'
export type RecentesCadastroFiltro = 'todos' | 'mes_atual' | 'ultimos_30' | 'ultimos_90'
export type RecentesStatusFiltro = 'todos' | ClienteStatus

export interface RecentesTableFiltros {
  segmento: string
  cadastro: RecentesCadastroFiltro
  status: RecentesStatusFiltro
}

export interface ClienteFormValues {
  tipo: ClienteTipo
  nome: string
  nomeFantasia: string
  documento: string
  email: string
  telefone: string
  segmento: string
  cidade: string
  estado: string
  observacao: string
  formaPagamentoPreferida: ClienteFormaPagamento
  parcelasPreferidas: number
  taxaJurosMensalPreferida: number
}

export interface ClientePedido {
  id: string
  clienteId: string
  data: string
  dataIso: string
  numero: string
  valor: number
  status: 'concluido' | 'pendente' | 'cancelado'
}

export interface Cliente {
  id: string
  nome: string
  nomeFantasia?: string
  tipo: ClienteTipo
  documento: string
  email: string
  telefone: string
  cidade: string
  estado: string
  segmento: string
  status: ClienteStatus
  formaPagamentoPreferida: ClienteFormaPagamento
  parcelasPreferidas: number
  taxaJurosMensalPreferida: number
  condicaoPagamentoDescricao: string
  cadastroIso: string
  cadastro: string
  ultimaCompraIso: string | null
  ultimaCompra: string | null
  totalVendas: number
  quantidadePedidos: number
  observacao?: string
}

export interface FilterOption<T extends string = string> {
  id: T
  label: string
}

export interface SegmentoSummary {
  segmento: string
  total: number
  quantidade: number
  percentual: number
}

export interface CidadeSummary {
  cidade: string
  estado: string
  quantidade: number
  totalVendas: number
}

export interface TableColumn<T> {
  key: string
  header: string
  align?: 'left' | 'right' | 'center'
  headerClassName?: string
  cellClassName?: string
  render: (row: T) => ReactNode
}
