import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { categoriaService } from '@/services/categoria.service'
import {
  mapProdutoFormToPayload,
  produtoService,
  type CreateProdutoPayload,
  type UpdateProdutoPayload,
} from '@/services/produto.service'
import { useProdutosStore } from '@/features/produtos/store/useProdutosStore'
import type { ProdutoFormValues } from '@/features/produtos/types'

export const produtosQueryKeys = {
  all: ['produtos'] as const,
  lists: () => [...produtosQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...produtosQueryKeys.all, 'detail', id] as const,
}

export const categoriasQueryKeys = {
  all: ['categorias'] as const,
  lists: () => [...categoriasQueryKeys.all, 'list'] as const,
}

export function useProdutosQuery() {
  const setProdutos = useProdutosStore((state) => state.setProdutos)

  const query = useQuery({
    queryKey: produtosQueryKeys.lists(),
    queryFn: () => produtoService.list(),
  })

  useEffect(() => {
    if (query.data) {
      setProdutos(query.data)
    }
  }, [query.data, setProdutos])

  return query
}

export function useCategoriasQuery() {
  const setCategorias = useProdutosStore((state) => state.setCategorias)

  const query = useQuery({
    queryKey: categoriasQueryKeys.lists(),
    queryFn: () => categoriaService.list(),
  })

  useEffect(() => {
    if (query.data) {
      setCategorias(query.data)
    }
  }, [query.data, setCategorias])

  return query
}

export function useProdutoQuery(id: string | undefined) {
  const upsertProduto = useProdutosStore((state) => state.upsertProduto)

  const query = useQuery({
    queryKey: produtosQueryKeys.detail(id ?? ''),
    queryFn: () => produtoService.getById(id!),
    enabled: Boolean(id),
  })

  useEffect(() => {
    if (query.data) {
      upsertProduto(query.data)
    }
  }, [query.data, upsertProduto])

  return query
}

export function useCreateCategoriaMutation() {
  const queryClient = useQueryClient()
  const setCategorias = useProdutosStore((state) => state.setCategorias)

  return useMutation({
    mutationFn: (payload: { nome: string; cor?: string }) => categoriaService.create(payload),
    onSuccess: (categoria) => {
      const current = useProdutosStore.getState().categorias
      setCategorias([categoria, ...current.filter((item) => item.id !== categoria.id)])
      queryClient.invalidateQueries({ queryKey: categoriasQueryKeys.lists() })
    },
  })
}

export function useCreateProdutoMutation() {
  const queryClient = useQueryClient()
  const upsertProduto = useProdutosStore((state) => state.upsertProduto)

  return useMutation({
    mutationFn: async (values: ProdutoFormValues) => {
      const created = await produtoService.create(mapProdutoFormToPayload(values))
      await produtoService.uploadPendingArquivos(created.id, values)
      return produtoService.getById(created.id)
    },
    onSuccess: (produto) => {
      upsertProduto(produto)
      queryClient.invalidateQueries({ queryKey: produtosQueryKeys.lists() })
    },
  })
}

export function useUpdateProdutoMutation() {
  const queryClient = useQueryClient()
  const upsertProduto = useProdutosStore((state) => state.upsertProduto)

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ProdutoFormValues }) => {
      await produtoService.update(id, mapProdutoFormToPayload(values))
      await produtoService.uploadPendingArquivos(id, values)
      return produtoService.getById(id)
    },
    onSuccess: (produto) => {
      upsertProduto(produto)
      queryClient.invalidateQueries({ queryKey: produtosQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: produtosQueryKeys.detail(produto.id) })
    },
  })
}

export function useRemoveProdutoMutation() {
  const queryClient = useQueryClient()
  const removeProdutoFromCache = useProdutosStore((state) => state.removeProdutoFromCache)

  return useMutation({
    mutationFn: (id: string) => produtoService.remove(id),
    onSuccess: (_result, id) => {
      removeProdutoFromCache(id)
      queryClient.invalidateQueries({ queryKey: produtosQueryKeys.lists() })
      queryClient.removeQueries({ queryKey: produtosQueryKeys.detail(id) })
    },
  })
}

export type { CreateProdutoPayload, UpdateProdutoPayload }
