import { api } from '@/services/api'
import type { Cliente, ClienteFormValues, ClientePedido } from '@/features/clientes/types'

export type CreateClientePayload = {
  tipo: Cliente['tipo']
  nome: string
  documento: string
  email: string
  telefone: string
  cidade: string
  estado: string
  nomeFantasia?: string
  segmento?: string
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  observacao?: string
  formaPagamentoPreferida?: Cliente['formaPagamentoPreferida']
  parcelasPreferidas?: number
  taxaJurosMensalPreferida?: number
  diasVencimentoPreferidos?: number[]
}

export type UpdateClientePayload = Partial<CreateClientePayload>

function trimOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function mapClienteFormToPayload(values: ClienteFormValues): CreateClientePayload {
  return {
    tipo: values.tipo,
    nome: values.nome.trim(),
    nomeFantasia: trimOptional(values.nomeFantasia),
    documento: values.documento.trim(),
    email: values.email.trim(),
    telefone: values.telefone.trim(),
    segmento: values.segmento.trim() || undefined,
    cep: trimOptional(values.cep),
    logradouro: trimOptional(values.logradouro),
    numero: trimOptional(values.numero),
    complemento: trimOptional(values.complemento),
    bairro: trimOptional(values.bairro),
    cidade: values.cidade.trim(),
    estado: values.estado.trim(),
    observacao: trimOptional(values.observacao),
    formaPagamentoPreferida: values.formaPagamentoPreferida,
    parcelasPreferidas: values.parcelasPreferidas,
    taxaJurosMensalPreferida: values.taxaJurosMensalPreferida,
    diasVencimentoPreferidos: values.diasVencimentoPreferidos,
  }
}

export const clienteService = {
  async list(): Promise<Cliente[]> {
    const { data } = await api.get<Cliente[]>('/clientes')
    return data
  },

  async getById(id: string): Promise<Cliente> {
    const { data } = await api.get<Cliente>(`/clientes/${id}`)
    return data
  },

  async create(payload: CreateClientePayload): Promise<Cliente> {
    const { data } = await api.post<Cliente>('/clientes', payload)
    return data
  },

  async update(id: string, payload: UpdateClientePayload): Promise<Cliente> {
    const { data } = await api.patch<Cliente>(`/clientes/${id}`, payload)
    return data
  },

  async remove(id: string): Promise<Cliente> {
    const { data } = await api.delete<Cliente>(`/clientes/${id}`)
    return data
  },

  async getPedidos(id: string): Promise<ClientePedido[]> {
    const { data } = await api.get<ClientePedido[]>(`/clientes/${id}/pedidos`)
    return data
  },
}
