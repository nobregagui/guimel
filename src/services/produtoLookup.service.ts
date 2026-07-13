import type { ProdutoLookupOption } from '@/features/produtos/types'
import { api } from '@/services/api'

export type CreateLookupPayload = {
  nome: string
}

function createLookupService(resourcePath: string) {
  return {
    async list(): Promise<ProdutoLookupOption[]> {
      const { data } = await api.get<ProdutoLookupOption[]>(`/${resourcePath}`)
      return data
    },

    async create(payload: CreateLookupPayload): Promise<ProdutoLookupOption> {
      const { data } = await api.post<ProdutoLookupOption>(`/${resourcePath}`, {
        nome: payload.nome.trim(),
      })
      return data
    },
  }
}

export const marcaService = createLookupService('marcas')
export const fabricanteService = createLookupService('fabricantes')
export const linhaService = createLookupService('linhas')
export const colecaoService = createLookupService('colecoes')
export const modeloService = createLookupService('modelos')
export const fornecedorService = createLookupService('fornecedores')

export type ProdutoLookupResource =
  | 'marca'
  | 'fabricante'
  | 'linha'
  | 'colecao'
  | 'modelo'
  | 'fornecedor'

export const produtoLookupServices = {
  marca: marcaService,
  fabricante: fabricanteService,
  linha: linhaService,
  colecao: colecaoService,
  modelo: modeloService,
  fornecedor: fornecedorService,
} as const
