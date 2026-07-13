import { api } from '@/services/api'
import type { Categoria } from '@/features/produtos/types'

type CategoriaApi = {
  id: string
  nome: string
  cor: string
}

function mapCategoria(item: CategoriaApi): Categoria {
  return {
    id: item.id,
    nome: item.nome,
    cor: item.cor,
  }
}

export type CreateCategoriaPayload = {
  nome: string
  cor?: string
}

export const categoriaService = {
  async list(): Promise<Categoria[]> {
    const { data } = await api.get<CategoriaApi[]>('/categorias')
    return data.map(mapCategoria)
  },

  async create(payload: CreateCategoriaPayload): Promise<Categoria> {
    const { data } = await api.post<CategoriaApi>('/categorias', payload)
    return mapCategoria(data)
  },
}
