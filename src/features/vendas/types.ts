export type StatusPedido = 'orcamento' | 'confirmado' | 'faturado' | 'entregue' | 'cancelado'

export type FormaPagamento = 'boleto' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'transferencia'

export type TipoDesconto = 'percentual' | 'valor'

export interface ItemPedido {
  id: string
  produtoId: string
  descricao: string
  quantidade: number
  valorUnitario: number
  desconto: number
  tipoDesconto: TipoDesconto
  subtotal: number
}

export interface Pedido {
  id: string
  numero: string
  clienteId: string
  clienteNome: string
  clienteDocumento: string
  vendedorId: string | null
  vendedorNome: string | null
  status: StatusPedido
  formaPagamento: FormaPagamento
  condicaoPagamento: string
  dataIso: string
  dataEntregaIso: string | null
  itens: ItemPedido[]
  subtotal: number
  descontoTotal: number
  total: number
  observacao: string | null
  nfeChave: string | null
}

export interface PedidoFormValues {
  clienteId: string
  clienteNome: string
  clienteDocumento: string
  vendedorId: string
  vendedorNome: string
  formaPagamento: FormaPagamento
  condicaoPagamento: string
  dataEntregaIso: string
  itens: Omit<ItemPedido, 'id'>[]
  observacao: string
}

export interface VendasKpi {
  totalMes: number
  totalMesAnterior: number
  pedidosAbertos: number
  ticketMedio: number
  totalFaturado: number
  metaMes: number
}
