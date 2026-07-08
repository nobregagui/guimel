import { api } from '@/services/api'
import type { ItemPedido, Pedido, PedidoFormValues, StatusPedido } from '@/features/vendas/types'

export type CreatePedidoItemPayload = {
  produtoId?: string
  descricao: string
  quantidade: number
  valorUnitario: number
  desconto: number
  tipoDesconto: ItemPedido['tipoDesconto']
}

export type CreatePedidoPayload = {
  clienteId: string
  vendedorId?: string | null
  formaPagamento: Pedido['formaPagamento']
  parcelas: number
  taxaJurosMensal: number
  diasVencimento?: number[]
  dataEntregaIso?: string | null
  observacao?: string | null
  frete?: number
  jurosAdicionais?: number
  descontoAdicional?: number
  multa?: number
  itens: CreatePedidoItemPayload[]
}

export type UpdatePedidoPayload = CreatePedidoPayload

function trimOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export function mapPedidoFormToPayload(values: PedidoFormValues): CreatePedidoPayload {
  const vendedorId = trimOptional(values.vendedorId)

  return {
    clienteId: values.clienteId,
    vendedorId: vendedorId && isUuid(vendedorId) ? vendedorId : null,
    formaPagamento: values.formaPagamento,
    parcelas: values.parcelas,
    taxaJurosMensal: values.taxaJurosMensal,
    diasVencimento: values.diasVencimento,
    dataEntregaIso: values.dataEntregaIso || null,
    observacao: trimOptional(values.observacao) ?? null,
    frete: values.frete,
    jurosAdicionais: values.jurosAdicionais,
    descontoAdicional: values.descontoAdicional,
    multa: values.multa,
    itens: values.itens.map((item) => ({
      produtoId: trimOptional(item.produtoId),
      descricao: item.descricao.trim(),
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario,
      desconto: item.desconto,
      tipoDesconto: item.tipoDesconto,
    })),
  }
}

export const pedidoService = {
  async list(): Promise<Pedido[]> {
    const { data } = await api.get<Pedido[]>('/pedidos')
    return data
  },

  async getById(id: string): Promise<Pedido> {
    const { data } = await api.get<Pedido>(`/pedidos/${id}`)
    return data
  },

  async create(payload: CreatePedidoPayload): Promise<Pedido> {
    const { data } = await api.post<Pedido>('/pedidos', payload)
    return data
  },

  async update(id: string, payload: UpdatePedidoPayload): Promise<Pedido> {
    const { data } = await api.patch<Pedido>(`/pedidos/${id}`, payload)
    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/pedidos/${id}`)
  },

  async updateStatus(id: string, status: StatusPedido): Promise<Pedido> {
    const { data } = await api.patch<Pedido>(`/pedidos/${id}/status`, { status })
    return data
  },

  async confirmar(id: string): Promise<Pedido> {
    const { data } = await api.post<Pedido>(`/pedidos/${id}/confirmar`)
    return data
  },

  async emitirNfe(id: string): Promise<Pedido> {
    const { data } = await api.patch<Pedido>(`/pedidos/${id}/status`, { status: 'faturado' })
    return data
  },
}
