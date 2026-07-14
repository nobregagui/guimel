import type { Pedido, PedidoFormValues } from '@/features/vendas/types'

export function mapPedidoToFormValues(pedido: Pedido): PedidoFormValues {
  return {
    clienteId: pedido.clienteId,
    clienteNome: pedido.clienteNome,
    clienteDocumento: pedido.clienteDocumento,
    clienteFormaPagamentoPreferida: '',
    vendedorId: pedido.vendedorId ?? '',
    vendedorNome: pedido.vendedorNome ?? '',
    formaPagamento: pedido.formaPagamento,
    parcelas: pedido.parcelas,
    taxaJurosMensal: pedido.taxaJurosMensal,
    diasVencimento: [...pedido.diasVencimento],
    dataEntregaIso: pedido.dataEntregaIso ?? '',
    itens: pedido.itens.map(({ produtoId, descricao, quantidade, valorUnitario, desconto, tipoDesconto, subtotal }) => ({
      produtoId,
      descricao,
      quantidade,
      valorUnitario,
      desconto,
      tipoDesconto,
      subtotal,
    })),
    frete: pedido.frete,
    jurosAdicionais: pedido.jurosAdicionais,
    descontoAdicional: pedido.descontoAdicional,
    multa: pedido.multa,
    observacao: pedido.observacao ?? '',
  }
}
