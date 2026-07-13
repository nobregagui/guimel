import { create } from 'zustand'

import type { ProdutoLookupOption, ProdutoLookupKind } from '@/features/produtos/types'

type LookupKindWithoutCategoria = Exclude<ProdutoLookupKind, 'categoria'>

type LookupMap = Record<LookupKindWithoutCategoria, ProdutoLookupOption[]>

interface ProdutoLookupsState extends LookupMap {
  setLookups: (kind: LookupKindWithoutCategoria, options: ProdutoLookupOption[]) => void
  upsertLookup: (kind: LookupKindWithoutCategoria, option: ProdutoLookupOption) => void
  getOptions: (kind: LookupKindWithoutCategoria) => ProdutoLookupOption[]
}

const EMPTY: ProdutoLookupOption[] = []

export const useProdutoLookupsStore = create<ProdutoLookupsState>((set, get) => ({
  marca: EMPTY,
  fabricante: EMPTY,
  linha: EMPTY,
  colecao: EMPTY,
  modelo: EMPTY,
  fornecedor: EMPTY,

  getOptions: (kind) => get()[kind],

  setLookups: (kind, options) => {
    set((state) => (state[kind] === options ? state : { [kind]: options }))
  },

  upsertLookup: (kind, option) => {
    set((state) => {
      const current = state[kind]
      const index = current.findIndex((item) => item.id === option.id)
      if (index === -1) {
        return { [kind]: [option, ...current] }
      }
      return {
        [kind]: current.map((item) => (item.id === option.id ? option : item)),
      }
    })
  },
}))
