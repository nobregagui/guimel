import { create } from 'zustand'

import { CLIENTES } from '@/features/clientes/data/clientes'
import { CLIENTE_PEDIDOS } from '@/features/clientes/data/pedidos'
import type { Cliente, ClienteFormValues, ClientePedido } from '@/features/clientes/types'
import { buildClienteFromForm } from '@/features/clientes/utils'

interface ClientesState {
  clientes: Cliente[]
  pedidos: ClientePedido[]
  addCliente: (input: ClienteFormValues) => Cliente
  updateCliente: (id: string, input: Partial<ClienteFormValues>) => void
  getClienteById: (id: string) => Cliente | undefined
  getPedidosByClienteId: (clienteId: string) => ClientePedido[]
}

export const useClientesStore = create<ClientesState>((set, get) => ({
  clientes: CLIENTES,
  pedidos: CLIENTE_PEDIDOS,

  addCliente: (input) => {
    const cliente = buildClienteFromForm(input, get().clientes.length)
    set((state) => ({ clientes: [cliente, ...state.clientes] }))
    return cliente
  },

  updateCliente: (id, input) => {
    set((state) => ({
      clientes: state.clientes.map((cliente) => {
        if (cliente.id !== id) return cliente
        return {
          ...cliente,
          ...input,
          nomeFantasia: input.nomeFantasia?.trim() || undefined,
          observacao: input.observacao?.trim() || undefined,
        }
      }),
    }))
  },

  getClienteById: (id) => get().clientes.find((cliente) => cliente.id === id),

  getPedidosByClienteId: (clienteId) =>
    get()
      .pedidos.filter((pedido) => pedido.clienteId === clienteId)
      .sort((a, b) => b.dataIso.localeCompare(a.dataIso)),
}))
