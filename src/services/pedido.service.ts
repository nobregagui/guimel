import { api } from '@/services/api'
import type { VendaDocumentoTipo } from '@/features/vendas/documents/types'
import type { ItemPedido, Pedido, PedidoFormValues, StatusPedido } from '@/features/vendas/types'

/** Tipos com endpoint PDF no backend (sem query string). */
const DOCUMENTO_URL: Record<
  'pedido' | 'romaneio' | 'orcamento' | 'comprovante',
  (id: string) => string
> = {
  pedido: (id) => `/vendas/${id}/pdf`,
  orcamento: (id) => `/vendas/${id}/orcamento`,
  comprovante: (id) => `/vendas/${id}/comprovante`,
  romaneio: (id) => `/vendas/${id}/romaneio`,
}

function resolveDocumentoUrl(id: string, tipo: VendaDocumentoTipo): string {
  if (tipo === 'danfe') {
    const error = new Error('DANFE ainda não disponível.') as Error & {
      response?: { status: number }
    }
    error.response = { status: 404 }
    throw error
  }

  // "exportar" é alias do Pedido de Venda (mesmo PDF / mesmo path)
  const endpointTipo = tipo === 'exportar' ? 'pedido' : tipo
  return DOCUMENTO_URL[endpointTipo](id)
}

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
  /** Data da venda (ISO 8601). Base do cronograma no backend. */
  dataIso: string
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

/** Normaliza/valida dataIso para envio à API (sempre ISO válido). */
export function toPedidoDataIso(value: string | null | undefined): string {
  const raw = value?.trim()
  if (raw) {
    const parsed = new Date(raw)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  }
  return new Date().toISOString()
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
    dataIso: toPedidoDataIso(values.dataIso),
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

  async getDocumentoPdf(id: string, tipo: VendaDocumentoTipo): Promise<Blob> {
    const url = resolveDocumentoUrl(id, tipo)

    const { data, status, headers } = await api.get<Blob>(url, {
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf',
      },
    })

    const contentType = String(headers['content-type'] ?? data.type ?? '')
    if (contentType.includes('application/json') || contentType.includes('text/')) {
      let message = 'Documento ainda não disponível.'
      try {
        const text = await data.text()
        const parsed = JSON.parse(text) as { message?: string }
        if (typeof parsed.message === 'string') message = parsed.message
      } catch {
        // keep default message
      }

      const error = new Error(message) as Error & { response?: { status: number } }
      error.response = { status: status === 200 ? 404 : status }
      throw error
    }

    return data
  },
}
