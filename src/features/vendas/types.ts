export type StatusPedido = 'orcamento' | 'confirmado' | 'faturado' | 'entregue' | 'cancelado'

export type FormaPagamento = 'pix' | 'boleto' | 'transferencia' | 'cartao' | 'debito'

export type TipoDesconto = 'percentual' | 'valor'

export interface Parcela {
  numero: number
  vencimentoIso: string
  valor: number
  juros: number
  valorComJuros: number
}

export interface CondicaoPagamento {
  formaPagamento: FormaPagamento
  parcelas: number
  intervaloDias: number
  taxaJurosMensal: number
  descricao: string
  cronograma: Parcela[]
  totalComJuros: number
  totalJuros: number
}

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
  parcelas: number
  taxaJurosMensal: number
  condicaoPagamentoDescricao: string
  cronograma: Parcela[]
  dataIso: string
  dataEntregaIso: string | null
  itens: ItemPedido[]
  subtotal: number
  descontoTotal: number
  total: number
  totalComJuros: number
  totalJuros: number
  observacao: string | null
  nfeChave: string | null
}

export interface PedidoFormValues {
  clienteId: string
  clienteNome: string
  clienteDocumento: string
  clienteFormaPagamentoPreferida: FormaPagamento | ''
  vendedorId: string
  vendedorNome: string
  formaPagamento: FormaPagamento
  parcelas: number
  taxaJurosMensal: number
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
