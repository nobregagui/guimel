import { create } from 'zustand'

import { PEDIDOS_MOCK } from '@/features/vendas/data/shared'
import type { Pedido, PedidoFormValues, StatusPedido } from '@/features/vendas/types'

interface VendasState {
  pedidos: Pedido[]
  addPedido: (values: PedidoFormValues) => void
  updatePedido: (id: string, values: Partial<PedidoFormValues>) => void
  updateStatus: (id: string, status: StatusPedido) => void
  deletePedido: (id: string) => void
  emitirNfe: (id: string) => void
}

let _counter = PEDIDOS_MOCK.length + 1

function proximoNumero(): string {
  return `PV-${String(_counter).padStart(4, '0')}`
}

function novoId(): string {
  return `p${Date.now()}`
}

export const useVendasStore = create<VendasState>((set) => ({
  pedidos: PEDIDOS_MOCK,

  addPedido: (values) => {
    const subtotal = values.itens.reduce((acc, item) => acc + item.subtotal, 0)
    const descontoTotal = values.itens.reduce((acc, item) => {
      const bruto = item.quantidade * item.valorUnitario
      return acc + (bruto - item.subtotal)
    }, 0)

    const novo: Pedido = {
      id: novoId(),
      numero: proximoNumero(),
      clienteId: values.clienteId,
      clienteNome: values.clienteNome,
      clienteDocumento: values.clienteDocumento,
      vendedorId: values.vendedorId || null,
      vendedorNome: values.vendedorNome || null,
      status: 'orcamento',
      formaPagamento: values.formaPagamento,
      condicaoPagamento: values.condicaoPagamento,
      dataIso: new Date().toISOString(),
      dataEntregaIso: values.dataEntregaIso || null,
      itens: values.itens.map((item, idx) => ({ ...item, id: `i${Date.now()}${idx}` })),
      subtotal,
      descontoTotal,
      total: subtotal - descontoTotal,
      observacao: values.observacao || null,
      nfeChave: null,
    }

    _counter++
    set((state) => ({ pedidos: [novo, ...state.pedidos] }))
  },

  updatePedido: (id, values) => {
    set((state) => ({
      pedidos: state.pedidos.map((p) => {
        if (p.id !== id) return p
        const itens = values.itens
          ? values.itens.map((item, idx) => ({ ...item, id: `i${Date.now()}${idx}` }))
          : p.itens
        const subtotal = itens.reduce((acc, item) => acc + item.subtotal, 0)
        const descontoTotal = itens.reduce((acc, item) => {
          const bruto = item.quantidade * item.valorUnitario
          return acc + (bruto - item.subtotal)
        }, 0)
        return {
          ...p,
          ...values,
          itens,
          subtotal,
          descontoTotal,
          total: subtotal - descontoTotal,
        } as Pedido
      }),
    }))
  },

  updateStatus: (id, status) => {
    set((state) => ({
      pedidos: state.pedidos.map((p) => (p.id === id ? { ...p, status } : p)),
    }))
  },

  deletePedido: (id) => {
    set((state) => ({ pedidos: state.pedidos.filter((p) => p.id !== id) }))
  },

  emitirNfe: (id) => {
    const chave = `35${new Date().getFullYear().toString().slice(-2)}${Math.random().toString().slice(2, 46).padEnd(44, '0').slice(0, 44)}`
    set((state) => ({
      pedidos: state.pedidos.map((p) =>
        p.id === id ? { ...p, status: 'faturado' as StatusPedido, nfeChave: chave } : p,
      ),
    }))
  },
}))
