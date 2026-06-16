import { api } from '@/services/api'
import type { Cliente, CreateClientePayload } from '@/types'

export const clienteService = {
  async list(): Promise<Cliente[]> {
    const { data } = await api.get<Cliente[]>('/clientes')
    return data
  },

  async create(payload: CreateClientePayload): Promise<Cliente> {
    const { data } = await api.post<Cliente>('/clientes', payload)
    return data
  },
}
