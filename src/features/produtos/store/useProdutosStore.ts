import { create } from 'zustand'

import type { Categoria, Produto } from '@/features/produtos/types'
import { findProdutoByNome } from '@/features/produtos/utils'

interface ProdutosState {
  produtos: Produto[]
  categorias: Categoria[]
  setProdutos: (produtos: Produto[]) => void
  setCategorias: (categorias: Categoria[]) => void
  upsertProduto: (produto: Produto) => void
  removeProdutoFromCache: (id: string) => void
  getProdutoById: (id: string) => Produto | undefined
  getProdutoByNome: (nome: string) => Produto | undefined
}

export const useProdutosStore = create<ProdutosState>((set, get) => ({
  produtos: [],
  categorias: [],

  setProdutos: (produtos) => {
    set((state) => (state.produtos === produtos ? state : { produtos }))
  },

  setCategorias: (categorias) => {
    set((state) => (state.categorias === categorias ? state : { categorias }))
  },

  upsertProduto: (produto) => {
    set((state) => {
      const index = state.produtos.findIndex((item) => item.id === produto.id)

      if (index === -1) {
        return { produtos: [produto, ...state.produtos] }
      }

      if (state.produtos[index] === produto) {
        return state
      }

      return {
        produtos: state.produtos.map((item) => (item.id === produto.id ? produto : item)),
      }
    })
  },

  removeProdutoFromCache: (id) => {
    set((state) => ({
      produtos: state.produtos.filter((item) => item.id !== id),
    }))
  },

  getProdutoById: (id) => get().produtos.find((produto) => produto.id === id),

  getProdutoByNome: (nome) => findProdutoByNome(get().produtos, nome),
}))
