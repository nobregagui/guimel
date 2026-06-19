import { create } from 'zustand'

import { PEDIDOS_MOCK } from '@/features/vendas/data/shared'
import type { Pedido, PedidoFormValues, StatusPedido } from '@/features/vendas/types'
import { calcularCondicao } from '@/features/vendas/utils/pagamento'

interface VendasState {
  pedidos: Pedido[]
  addPedido: (values: PedidoFormValues) => void
  updatePedido: (id: string, values: Partial<PedidoFormValues>) => void
  updateStatus: (id: string, status: StatusPedido) => void
  deletePedido: (id: string) => void
  emitirNfe: (id: string) => void
}

let _counter = PEDIDOS_MOCK.length + 1

function novoId(): string {
  return `p${Date.now()}`
}

function proximoNumero(): string {
  return `PV-${String(_counter).padStart(4, '0')}`
}

export const useVendasStore = create<VendasState>((set) => ({
  pedidos: PEDIDOS_MOCK,

  addPedido: (values) => {
    const subtotalBruto = values.itens.reduce(
      (acc, item) => acc + item.quantidade * item.valorUnitario,
      0,
    )
    const descontoTotal = values.itens.reduce((acc, item) => {
      const bruto = item.quantidade * item.valorUnitario
      return acc + (bruto - item.subtotal)
    }, 0)
    const total = subtotalBruto - descontoTotal

    const condicao = calcularCondicao(
      total,
      values.formaPagamento,
      values.parcelas,
      values.taxaJurosMensal,
      values.formaPagamento === 'boleto_prazo' ? values.diasVencimento : undefined,
    )

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
      parcelas: condicao.parcelas,
      taxaJurosMensal: condicao.taxaJurosMensal,
      diasVencimento: condicao.diasVencimento ?? [],
      condicaoPagamentoDescricao: condicao.descricao,
      cronograma: condicao.cronograma,
      dataIso: new Date().toISOString(),
      dataEntregaIso: values.dataEntregaIso || null,
      itens: values.itens.map((item, idx) => ({ ...item, id: `i${Date.now()}${idx}` })),
      subtotal: subtotalBruto,
      descontoTotal,
      total,
      totalComJuros: condicao.totalComJuros,
      totalJuros: condicao.totalJuros,
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

        const subtotalBruto = itens.reduce(
          (acc, item) => acc + item.quantidade * item.valorUnitario,
          0,
        )
        const descontoTotal = itens.reduce((acc, item) => {
          const bruto = item.quantidade * item.valorUnitario
          return acc + (bruto - item.subtotal)
        }, 0)
        const total = subtotalBruto - descontoTotal

        const forma = values.formaPagamento ?? p.formaPagamento
        const parcelas = values.parcelas ?? p.parcelas
        const taxa = values.taxaJurosMensal ?? p.taxaJurosMensal
        const dias =
          values.diasVencimento ??
          (forma === 'boleto_prazo' ? p.diasVencimento : undefined)
        const condicao = calcularCondicao(
          total,
          forma,
          parcelas,
          taxa,
          forma === 'boleto_prazo' ? dias : undefined,
        )

        return {
          ...p,
          ...values,
          itens,
          subtotal: subtotalBruto,
          descontoTotal,
          total,
          parcelas: condicao.parcelas,
          taxaJurosMensal: condicao.taxaJurosMensal,
          diasVencimento: condicao.diasVencimento ?? [],
          totalComJuros: condicao.totalComJuros,
          totalJuros: condicao.totalJuros,
          condicaoPagamentoDescricao: condicao.descricao,
          cronograma: condicao.cronograma,
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
