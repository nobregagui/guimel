import type { ProdutoLookupKind, ProdutoLookupOption } from '@/features/produtos/types'

export const LOOKUP_KIND_LABEL: Record<ProdutoLookupKind, string> = {
  categoria: 'Categoria',
  marca: 'Marca',
  fabricante: 'Fabricante',
  linha: 'Linha',
  colecao: 'Coleção',
  modelo: 'Modelo',
  fornecedor: 'Fornecedor',
}

export function createLookupOption(nome: string): ProdutoLookupOption {
  const id = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
  return { id, nome: nome.trim() }
}
