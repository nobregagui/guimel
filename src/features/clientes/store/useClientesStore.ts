import { create } from 'zustand'

import type { Cliente, ClientePedido } from '@/features/clientes/types'
import { findClienteByDocumento, findClienteByNome } from '@/features/clientes/utils'

interface ClientesState {
  clientes: Cliente[]
  pedidosByClienteId: Record<string, ClientePedido[]>
  setClientes: (clientes: Cliente[]) => void
  upsertCliente: (cliente: Cliente) => void
  setPedidosForCliente: (clienteId: string, pedidos: ClientePedido[]) => void
  getClienteById: (id: string) => Cliente | undefined
  getClienteByDocumento: (documento: string) => Cliente | undefined
  getClienteByNome: (nome: string) => Cliente | undefined
  getPedidosByClienteId: (clienteId: string) => ClientePedido[]
}

export const useClientesStore = create<ClientesState>((set, get) => ({
  clientes: [],
  pedidosByClienteId: {},

  setClientes: (clientes) => {
    set((state) => (state.clientes === clientes ? state : { clientes }))
  },

  upsertCliente: (cliente) => {
    set((state) => {
      const index = state.clientes.findIndex((item) => item.id === cliente.id)

      if (index === -1) {
        return { clientes: [cliente, ...state.clientes] }
      }

      if (state.clientes[index] === cliente) {
        return state
      }

      return {
        clientes: state.clientes.map((item) => (item.id === cliente.id ? cliente : item)),
      }
    })
  },

  setPedidosForCliente: (clienteId, pedidos) => {
    set((state) => {
      if (state.pedidosByClienteId[clienteId] === pedidos) {
        return state
      }

      return {
        pedidosByClienteId: {
          ...state.pedidosByClienteId,
          [clienteId]: pedidos,
        },
      }
    })
  },

  getClienteById: (id) => get().clientes.find((cliente) => cliente.id === id),

  getClienteByDocumento: (documento) => findClienteByDocumento(get().clientes, documento),

  getClienteByNome: (nome) => findClienteByNome(get().clientes, nome),

  getPedidosByClienteId: (clienteId) => get().pedidosByClienteId[clienteId] ?? [],
}))
