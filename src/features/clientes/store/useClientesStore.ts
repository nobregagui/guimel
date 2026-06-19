import { create } from 'zustand'

import { CLIENTES } from '@/features/clientes/data/clientes'
import { CLIENTE_PEDIDOS } from '@/features/clientes/data/pedidos'
import type { Cliente, ClienteFormValues, ClientePedido } from '@/features/clientes/types'
import { buildClienteFromForm, findClienteByDocumento, findClienteByNome, resolveCondicaoDescricao } from '@/features/clientes/utils'

interface ClientesState {
  clientes: Cliente[]
  pedidos: ClientePedido[]
  addCliente: (input: ClienteFormValues) => Cliente
  updateCliente: (id: string, input: Partial<ClienteFormValues>) => void
  getClienteById: (id: string) => Cliente | undefined
  getClienteByDocumento: (documento: string) => Cliente | undefined
  getClienteByNome: (nome: string) => Cliente | undefined
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

        const forma = input.formaPagamentoPreferida ?? cliente.formaPagamentoPreferida
        const parcelas = input.parcelasPreferidas ?? cliente.parcelasPreferidas
        const taxa = input.taxaJurosMensalPreferida ?? cliente.taxaJurosMensalPreferida
        const diasVencimentoPreferidos =
          input.diasVencimentoPreferidos ?? cliente.diasVencimentoPreferidos

        return {
          ...cliente,
          ...input,
          nome: input.nome?.trim() ?? cliente.nome,
          nomeFantasia: input.nomeFantasia !== undefined ? input.nomeFantasia.trim() || undefined : cliente.nomeFantasia,
          documento: input.documento?.trim() ?? cliente.documento,
          email: input.email?.trim() ?? cliente.email,
          telefone: input.telefone?.trim() ?? cliente.telefone,
          cep: input.cep?.trim() ?? cliente.cep,
          logradouro: input.logradouro?.trim() ?? cliente.logradouro,
          numero: input.numero?.trim() ?? cliente.numero,
          complemento: input.complemento !== undefined ? input.complemento.trim() : cliente.complemento,
          bairro: input.bairro?.trim() ?? cliente.bairro,
          cidade: input.cidade?.trim() ?? cliente.cidade,
          estado: input.estado?.trim() ?? cliente.estado,
          observacao: input.observacao !== undefined ? input.observacao.trim() || undefined : cliente.observacao,
          formaPagamentoPreferida: forma,
          parcelasPreferidas: parcelas,
          taxaJurosMensalPreferida: taxa,
          diasVencimentoPreferidos,
          condicaoPagamentoDescricao: resolveCondicaoDescricao(forma, parcelas, taxa, diasVencimentoPreferidos),
        }
      }),
    }))
  },

  getClienteById: (id) => get().clientes.find((cliente) => cliente.id === id),

  getClienteByDocumento: (documento) => findClienteByDocumento(get().clientes, documento),

  getClienteByNome: (nome) => findClienteByNome(get().clientes, nome),

  getPedidosByClienteId: (clienteId) =>
    get()
      .pedidos.filter((pedido) => pedido.clienteId === clienteId)
      .sort((a, b) => b.dataIso.localeCompare(a.dataIso)),
}))
