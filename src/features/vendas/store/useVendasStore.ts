import { create } from 'zustand'

import type { Pedido } from '@/features/vendas/types'

interface VendasState {
  pedidos: Pedido[]
  setPedidos: (pedidos: Pedido[]) => void
  upsertPedido: (pedido: Pedido) => void
  removePedidoFromCache: (id: string) => void
  getPedidoById: (id: string) => Pedido | undefined
}

export const useVendasStore = create<VendasState>((set, get) => ({
  pedidos: [],

  setPedidos: (pedidos) => {
    set((state) => (state.pedidos === pedidos ? state : { pedidos }))
  },

  upsertPedido: (pedido) => {
    set((state) => {
      const index = state.pedidos.findIndex((item) => item.id === pedido.id)

      if (index === -1) {
        return { pedidos: [pedido, ...state.pedidos] }
      }

      if (state.pedidos[index] === pedido) {
        return state
      }

      return {
        pedidos: state.pedidos.map((item) => (item.id === pedido.id ? pedido : item)),
      }
    })
  },

  removePedidoFromCache: (id) => {
    set((state) => ({
      pedidos: state.pedidos.filter((item) => item.id !== id),
    }))
  },

  getPedidoById: (id) => get().pedidos.find((pedido) => pedido.id === id),
}))
