import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  mapPedidoFormToPayload,
  pedidoService,
  type CreatePedidoPayload,
  type UpdatePedidoPayload,
} from '@/services/pedido.service'
import { useVendasStore } from '@/features/vendas/store/useVendasStore'
import type { PedidoFormValues, StatusPedido } from '@/features/vendas/types'

export const pedidosQueryKeys = {
  all: ['pedidos'] as const,
  lists: () => [...pedidosQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...pedidosQueryKeys.all, 'detail', id] as const,
}

export function usePedidosQuery() {
  const setPedidos = useVendasStore((state) => state.setPedidos)

  const query = useQuery({
    queryKey: pedidosQueryKeys.lists(),
    queryFn: () => pedidoService.list(),
  })

  useEffect(() => {
    if (query.data) {
      setPedidos(query.data)
    }
  }, [query.data, setPedidos])

  return query
}

export function usePedidoQuery(id: string | undefined) {
  const upsertPedido = useVendasStore((state) => state.upsertPedido)

  const query = useQuery({
    queryKey: pedidosQueryKeys.detail(id ?? ''),
    queryFn: () => pedidoService.getById(id!),
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (query.data) {
      upsertPedido(query.data)
    }
  }, [query.data, upsertPedido])

  return query
}

export function useCreatePedidoMutation() {
  const queryClient = useQueryClient()
  const upsertPedido = useVendasStore((state) => state.upsertPedido)

  return useMutation({
    mutationFn: (values: PedidoFormValues) =>
      pedidoService.create(mapPedidoFormToPayload(values)),
    onSuccess: (pedido) => {
      upsertPedido(pedido)
      queryClient.invalidateQueries({ queryKey: pedidosQueryKeys.lists() })
    },
  })
}

export function useUpdatePedidoMutation() {
  const queryClient = useQueryClient()
  const upsertPedido = useVendasStore((state) => state.upsertPedido)

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: PedidoFormValues }) =>
      pedidoService.update(id, mapPedidoFormToPayload(values)),
    onSuccess: (pedido) => {
      upsertPedido(pedido)
      queryClient.invalidateQueries({ queryKey: pedidosQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: pedidosQueryKeys.detail(pedido.id) })
    },
  })
}

export function useRemovePedidoMutation() {
  const queryClient = useQueryClient()
  const removePedidoFromCache = useVendasStore((state) => state.removePedidoFromCache)

  return useMutation({
    mutationFn: (id: string) => pedidoService.remove(id),
    onSuccess: (_result, id) => {
      removePedidoFromCache(id)
      queryClient.invalidateQueries({ queryKey: pedidosQueryKeys.lists() })
      queryClient.removeQueries({ queryKey: pedidosQueryKeys.detail(id) })
    },
  })
}

export function useUpdatePedidoStatusMutation() {
  const queryClient = useQueryClient()
  const upsertPedido = useVendasStore((state) => state.upsertPedido)

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusPedido }) =>
      pedidoService.updateStatus(id, status),
    onSuccess: (pedido) => {
      upsertPedido(pedido)
      queryClient.invalidateQueries({ queryKey: pedidosQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: pedidosQueryKeys.detail(pedido.id) })
    },
  })
}

export function useConfirmarPedidoMutation() {
  const queryClient = useQueryClient()
  const upsertPedido = useVendasStore((state) => state.upsertPedido)

  return useMutation({
    mutationFn: (id: string) => pedidoService.confirmar(id),
    onSuccess: (pedido) => {
      upsertPedido(pedido)
      queryClient.invalidateQueries({ queryKey: pedidosQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: pedidosQueryKeys.detail(pedido.id) })
    },
  })
}

export function useEmitirNfePedidoMutation() {
  const queryClient = useQueryClient()
  const upsertPedido = useVendasStore((state) => state.upsertPedido)

  return useMutation({
    mutationFn: (id: string) => pedidoService.emitirNfe(id),
    onSuccess: (pedido) => {
      upsertPedido(pedido)
      queryClient.invalidateQueries({ queryKey: pedidosQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: pedidosQueryKeys.detail(pedido.id) })
    },
  })
}

export type { CreatePedidoPayload, UpdatePedidoPayload }
