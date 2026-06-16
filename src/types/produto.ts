export interface Produto {
  id: string
  nome: string
  sku: string
  preco: number
  estoque: number
  ativo: boolean
}

export interface CreateProdutoPayload {
  nome: string
  sku: string
  preco: number
  estoque: number
}
