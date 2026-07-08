import { api } from '@/services/api'
import type { Produto, ProdutoFormValues } from '@/features/produtos/types'

export type CreateProdutoPayload = {
  codigo?: string
  codigoBarras?: string | null
  nome: string
  descricao?: string | null
  tipo: Produto['tipo']
  status: Produto['status']
  categoriaId?: string | null
  unidadeMedida: Produto['unidadeMedida']
  precoCusto: number
  precoVenda: number
  precoPromocional?: number | null
  ncm: string
  cfop: string
  cst: string
  origem: Produto['origem']
  aliquotaIcms: number
  aliquotaPis: number
  aliquotaCofins: number
  estoqueAtual: number
  estoqueMinimo: number
  estoqueMaximo?: number | null
  controlaEstoque: boolean
}

export type UpdateProdutoPayload = Partial<CreateProdutoPayload>

function trimOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

export function mapProdutoFormToPayload(values: ProdutoFormValues): CreateProdutoPayload {
  return {
    codigo: trimOptional(values.codigo),
    codigoBarras: values.codigoBarras.trim() || null,
    nome: values.nome.trim(),
    descricao: values.descricao.trim() || null,
    tipo: values.tipo,
    status: values.status,
    categoriaId: values.categoriaId || null,
    unidadeMedida: values.unidadeMedida,
    precoCusto: values.precoCusto,
    precoVenda: values.precoVenda,
    precoPromocional: values.precoPromocional,
    ncm: values.ncm.trim(),
    cfop: values.cfop.trim(),
    cst: values.cst.trim(),
    origem: values.origem,
    aliquotaIcms: values.aliquotaIcms,
    aliquotaPis: values.aliquotaPis,
    aliquotaCofins: values.aliquotaCofins,
    estoqueAtual: values.estoqueAtual,
    estoqueMinimo: values.estoqueMinimo,
    estoqueMaximo: values.estoqueMaximo,
    controlaEstoque: values.controlaEstoque,
  }
}

export const produtoService = {
  async list(): Promise<Produto[]> {
    const { data } = await api.get<Produto[]>('/produtos')
    return data
  },

  async getById(id: string): Promise<Produto> {
    const { data } = await api.get<Produto>(`/produtos/${id}`)
    return data
  },

  async create(payload: CreateProdutoPayload): Promise<Produto> {
    const { data } = await api.post<Produto>('/produtos', payload)
    return data
  },

  async update(id: string, payload: UpdateProdutoPayload): Promise<Produto> {
    const { data } = await api.patch<Produto>(`/produtos/${id}`, payload)
    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/produtos/${id}`)
  },
}
