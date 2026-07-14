import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  clienteService,
  mapClienteFormToPayload,
  type CreateClientePayload,
  type UpdateClientePayload,
} from '@/services/cliente.service'
import { useClientesStore } from '@/features/clientes/store/useClientesStore'
import type { ClienteFormValues, ClienteStatus } from '@/features/clientes/types'

export const clientesQueryKeys = {
  all: ['clientes'] as const,
  lists: () => [...clientesQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...clientesQueryKeys.all, 'detail', id] as const,
  pedidos: (id: string) => [...clientesQueryKeys.all, 'pedidos', id] as const,
}

export function useClientesQuery() {
  const setClientes = useClientesStore((state) => state.setClientes)

  const query = useQuery({
    queryKey: clientesQueryKeys.lists(),
    queryFn: () => clienteService.list(),
  })

  useEffect(() => {
    if (query.data) {
      setClientes(query.data)
    }
  }, [query.data, setClientes])

  return query
}

export function useClienteQuery(id: string | undefined) {
  const upsertCliente = useClientesStore((state) => state.upsertCliente)

  const query = useQuery({
    queryKey: clientesQueryKeys.detail(id ?? ''),
    queryFn: () => clienteService.getById(id!),
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (query.data) {
      upsertCliente(query.data)
    }
  }, [query.data, upsertCliente])

  return query
}

export function useClientePedidosQuery(clienteId: string | undefined) {
  const setPedidosForCliente = useClientesStore((state) => state.setPedidosForCliente)

  const query = useQuery({
    queryKey: clientesQueryKeys.pedidos(clienteId ?? ''),
    queryFn: () => clienteService.getPedidos(clienteId!),
    enabled: Boolean(clienteId),
  })

  useEffect(() => {
    if (query.data && clienteId) {
      setPedidosForCliente(clienteId, query.data)
    }
  }, [clienteId, query.data, setPedidosForCliente])

  return query
}

export function useCreateClienteMutation() {
  const queryClient = useQueryClient()
  const upsertCliente = useClientesStore((state) => state.upsertCliente)

  return useMutation({
    mutationFn: (values: ClienteFormValues) =>
      clienteService.create(mapClienteFormToPayload(values)),
    onSuccess: (cliente) => {
      upsertCliente(cliente)
      queryClient.invalidateQueries({ queryKey: clientesQueryKeys.lists() })
    },
  })
}

export function useUpdateClienteMutation() {
  const queryClient = useQueryClient()
  const upsertCliente = useClientesStore((state) => state.upsertCliente)

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ClienteFormValues }) =>
      clienteService.update(id, mapClienteFormToPayload(values)),
    onSuccess: (cliente) => {
      upsertCliente(cliente)
      queryClient.invalidateQueries({ queryKey: clientesQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clientesQueryKeys.detail(cliente.id) })
    },
  })
}

export function useRemoveClienteMutation() {
  const queryClient = useQueryClient()
  const removeClienteFromCache = useClientesStore((state) => state.removeClienteFromCache)

  return useMutation({
    mutationFn: (id: string) => clienteService.remove(id),
    onSuccess: (_result, id) => {
      removeClienteFromCache(id)
      queryClient.invalidateQueries({ queryKey: clientesQueryKeys.lists() })
      queryClient.removeQueries({ queryKey: clientesQueryKeys.detail(id) })
      queryClient.removeQueries({ queryKey: clientesQueryKeys.pedidos(id) })
    },
  })
}

export function useUpdateClienteStatusMutation() {
  const queryClient = useQueryClient()
  const upsertCliente = useClientesStore((state) => state.upsertCliente)

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ClienteStatus }) =>
      clienteService.updateStatus(id, status),
    onSuccess: (cliente) => {
      upsertCliente(cliente)
      queryClient.invalidateQueries({ queryKey: clientesQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clientesQueryKeys.detail(cliente.id) })
    },
  })
}

export type { CreateClientePayload, UpdateClientePayload }
