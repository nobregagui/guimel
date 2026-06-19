import type { FormaPagamento, Pedido, StatusPedido } from '@/features/vendas/types'

export const FORMA_PAGAMENTO_LABEL: Record<FormaPagamento, string> = {
  pix: 'PIX',
  boleto: 'Boleto',
  boleto_prazo: 'Boleto a prazo',
  transferencia: 'Transferência',
  cartao: 'Cartão de crédito',
  debito: 'Débito',
}

export const STATUS_PEDIDO_LABEL: Record<StatusPedido, string> = {
  orcamento: 'Orçamento',
  confirmado: 'Confirmado',
  faturado: 'Faturado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

export const STATUS_PEDIDO_ORDEM: StatusPedido[] = [
  'orcamento',
  'confirmado',
  'faturado',
  'entregue',
  'cancelado',
]

export function calcularSubtotalItem(
  quantidade: number,
  valorUnitario: number,
  desconto: number,
  tipoDesconto: 'percentual' | 'valor',
): number {
  const bruto = quantidade * valorUnitario
  if (tipoDesconto === 'percentual') return bruto * (1 - desconto / 100)
  return Math.max(0, bruto - desconto)
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function formatarData(isoString: string): string {
  return new Date(isoString).toLocaleDateString('pt-BR')
}

export const PEDIDOS_MOCK: Pedido[] = [
  {
    id: 'p1',
    numero: 'PV-0001',
    clienteId: 'c1',
    clienteNome: 'Supermercados Pinheiro Ltda',
    clienteDocumento: '12.345.678/0001-99',
    vendedorId: 'v1',
    vendedorNome: 'Carlos Mendes',
    status: 'entregue',
    formaPagamento: 'boleto',
    parcelas: 2,
    taxaJurosMensal: 0,
    diasVencimento: [],
    condicaoPagamentoDescricao: '2× sem juros (30/60)',
    cronograma: [
      { numero: 1, vencimentoIso: '2025-07-10T00:00:00Z', valor: 1575, juros: 0, valorComJuros: 1575 },
      { numero: 2, vencimentoIso: '2025-08-10T00:00:00Z', valor: 1575, juros: 0, valorComJuros: 1575 },
    ],
    dataIso: '2025-06-10T14:00:00Z',
    dataEntregaIso: '2025-06-14T10:00:00Z',
    itens: [
      { id: 'i1', produtoId: 'pr1', descricao: 'Produto A', quantidade: 10, valorUnitario: 250, desconto: 5, tipoDesconto: 'percentual', subtotal: 2375 },
      { id: 'i2', produtoId: 'pr2', descricao: 'Produto B', quantidade: 5, valorUnitario: 180, desconto: 0, tipoDesconto: 'valor', subtotal: 900 },
    ],
    subtotal: 3275,
    descontoTotal: 125,
    total: 3150,
    totalComJuros: 3150,
    totalJuros: 0,
    observacao: null,
    nfeChave: '35250612345678000199550010000000011234567890',
  },
  {
    id: 'p2',
    numero: 'PV-0002',
    clienteId: 'c2',
    clienteNome: 'Tech Solutions S.A.',
    clienteDocumento: '98.765.432/0001-11',
    vendedorId: 'v2',
    vendedorNome: 'Ana Oliveira',
    status: 'confirmado',
    formaPagamento: 'pix',
    parcelas: 1,
    taxaJurosMensal: 0,
    diasVencimento: [],
    condicaoPagamentoDescricao: 'À vista (PIX)',
    cronograma: [
      { numero: 1, vencimentoIso: '2025-06-12T09:30:00Z', valor: 8100, juros: 0, valorComJuros: 8100 },
    ],
    dataIso: '2025-06-12T09:30:00Z',
    dataEntregaIso: '2025-06-18T00:00:00Z',
    itens: [
      { id: 'i3', produtoId: 'pr3', descricao: 'Produto C', quantidade: 2, valorUnitario: 4500, desconto: 10, tipoDesconto: 'percentual', subtotal: 8100 },
    ],
    subtotal: 9000,
    descontoTotal: 900,
    total: 8100,
    totalComJuros: 8100,
    totalJuros: 0,
    observacao: 'Entrega no período da manhã.',
    nfeChave: null,
  },
  {
    id: 'p3',
    numero: 'PV-0003',
    clienteId: 'c3',
    clienteNome: 'Farmácia Bem Estar',
    clienteDocumento: '55.444.333/0001-22',
    vendedorId: 'v1',
    vendedorNome: 'Carlos Mendes',
    status: 'orcamento',
    formaPagamento: 'cartao',
    parcelas: 6,
    taxaJurosMensal: 0,
    diasVencimento: [],
    condicaoPagamentoDescricao: '6× sem juros',
    cronograma: [
      { numero: 1, vencimentoIso: '2025-07-15T00:00:00Z', valor: 125, juros: 0, valorComJuros: 125 },
      { numero: 2, vencimentoIso: '2025-08-15T00:00:00Z', valor: 125, juros: 0, valorComJuros: 125 },
      { numero: 3, vencimentoIso: '2025-09-15T00:00:00Z', valor: 125, juros: 0, valorComJuros: 125 },
      { numero: 4, vencimentoIso: '2025-10-15T00:00:00Z', valor: 125, juros: 0, valorComJuros: 125 },
      { numero: 5, vencimentoIso: '2025-11-15T00:00:00Z', valor: 125, juros: 0, valorComJuros: 125 },
      { numero: 6, vencimentoIso: '2025-12-15T00:00:00Z', valor: 125, juros: 0, valorComJuros: 125 },
    ],
    dataIso: '2025-06-15T16:00:00Z',
    dataEntregaIso: null,
    itens: [
      { id: 'i4', produtoId: 'pr1', descricao: 'Produto A', quantidade: 3, valorUnitario: 250, desconto: 0, tipoDesconto: 'valor', subtotal: 750 },
    ],
    subtotal: 750,
    descontoTotal: 0,
    total: 750,
    totalComJuros: 750,
    totalJuros: 0,
    observacao: 'Aguardando aprovação do cliente.',
    nfeChave: null,
  },
  {
    id: 'p4',
    numero: 'PV-0004',
    clienteId: 'c4',
    clienteNome: 'Construtora Horizonte',
    clienteDocumento: '11.222.333/0001-44',
    vendedorId: 'v2',
    vendedorNome: 'Ana Oliveira',
    status: 'faturado',
    formaPagamento: 'boleto',
    parcelas: 3,
    taxaJurosMensal: 0,
    diasVencimento: [],
    condicaoPagamentoDescricao: '3× sem juros',
    cronograma: [
      { numero: 1, vencimentoIso: '2025-07-08T00:00:00Z', valor: 2066.67, juros: 0, valorComJuros: 2066.67 },
      { numero: 2, vencimentoIso: '2025-08-08T00:00:00Z', valor: 2066.67, juros: 0, valorComJuros: 2066.67 },
      { numero: 3, vencimentoIso: '2025-09-08T00:00:00Z', valor: 2066.66, juros: 0, valorComJuros: 2066.66 },
    ],
    dataIso: '2025-06-08T11:00:00Z',
    dataEntregaIso: '2025-06-20T00:00:00Z',
    itens: [
      { id: 'i5', produtoId: 'pr4', descricao: 'Produto D', quantidade: 20, valorUnitario: 310, desconto: 0, tipoDesconto: 'valor', subtotal: 6200 },
    ],
    subtotal: 6200,
    descontoTotal: 0,
    total: 6200,
    totalComJuros: 6200,
    totalJuros: 0,
    observacao: null,
    nfeChave: '35250611222333000144550010000000041987654321',
  },
  {
    id: 'p5',
    numero: 'PV-0005',
    clienteId: 'c5',
    clienteNome: 'Rodrigo Lima ME',
    clienteDocumento: '333.444.555-66',
    vendedorId: null,
    vendedorNome: null,
    status: 'cancelado',
    formaPagamento: 'cartao',
    parcelas: 3,
    taxaJurosMensal: 0,
    diasVencimento: [],
    condicaoPagamentoDescricao: '3× sem juros',
    cronograma: [],
    dataIso: '2025-06-05T08:00:00Z',
    dataEntregaIso: null,
    itens: [],
    subtotal: 0,
    descontoTotal: 0,
    total: 0,
    totalComJuros: 0,
    totalJuros: 0,
    observacao: 'Cliente desistiu da compra.',
    nfeChave: null,
  },
]
