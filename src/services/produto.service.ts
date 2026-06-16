import { api } from '@/services/api'
import type { CreateProdutoPayload, Produto } from '@/types'

export const produtoService = {
  async list(): Promise<Produto[]> {
    const { data } = await api.get<Produto[]>('/produtos')
    return data
  },

  async create(payload: CreateProdutoPayload): Promise<Produto> {
    const { data } = await api.post<Produto>('/produtos', payload)
    return data
  },
}
