import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useProdutoLookupsStore } from '@/features/produtos/store/useProdutoLookupsStore'
import type { ProdutoLookupOption } from '@/features/produtos/types'
import {
  produtoLookupServices,
  type ProdutoLookupResource,
} from '@/services/produtoLookup.service'

export const produtoLookupsQueryKeys = {
  all: ['produto-lookups'] as const,
  list: (resource: ProdutoLookupResource) =>
    [...produtoLookupsQueryKeys.all, 'list', resource] as const,
}

const LOOKUP_RESOURCES: ProdutoLookupResource[] = [
  'marca',
  'fabricante',
  'linha',
  'colecao',
  'modelo',
  'fornecedor',
]

function useLookupListQuery(resource: ProdutoLookupResource) {
  const setLookups = useProdutoLookupsStore((state) => state.setLookups)

  const query = useQuery({
    queryKey: produtoLookupsQueryKeys.list(resource),
    queryFn: () => produtoLookupServices[resource].list(),
  })

  useEffect(() => {
    if (query.data) {
      setLookups(resource, query.data)
    }
  }, [query.data, resource, setLookups])

  return query
}

export function useMarcasQuery() {
  return useLookupListQuery('marca')
}

export function useFabricantesQuery() {
  return useLookupListQuery('fabricante')
}

export function useLinhasQuery() {
  return useLookupListQuery('linha')
}

export function useColecoesQuery() {
  return useLookupListQuery('colecao')
}

export function useModelosQuery() {
  return useLookupListQuery('modelo')
}

export function useFornecedoresQuery() {
  return useLookupListQuery('fornecedor')
}

/** Prefetch all commercial classification lookups used by ProdutoDrawer. */
export function useProdutoLookupsQueries() {
  const marcas = useMarcasQuery()
  const fabricantes = useFabricantesQuery()
  const linhas = useLinhasQuery()
  const colecoes = useColecoesQuery()
  const modelos = useModelosQuery()
  const fornecedores = useFornecedoresQuery()

  return {
    isLoading:
      marcas.isLoading
      || fabricantes.isLoading
      || linhas.isLoading
      || colecoes.isLoading
      || modelos.isLoading
      || fornecedores.isLoading,
    isError:
      marcas.isError
      || fabricantes.isError
      || linhas.isError
      || colecoes.isError
      || modelos.isError
      || fornecedores.isError,
    refetchAll: () => {
      void marcas.refetch()
      void fabricantes.refetch()
      void linhas.refetch()
      void colecoes.refetch()
      void modelos.refetch()
      void fornecedores.refetch()
    },
  }
}

export function useCreateLookupMutation(resource: ProdutoLookupResource) {
  const queryClient = useQueryClient()
  const upsertLookup = useProdutoLookupsStore((state) => state.upsertLookup)

  return useMutation({
    mutationFn: (nome: string) => produtoLookupServices[resource].create({ nome }),
    onSuccess: (option: ProdutoLookupOption) => {
      upsertLookup(resource, option)
      queryClient.invalidateQueries({ queryKey: produtoLookupsQueryKeys.list(resource) })
    },
  })
}

export { LOOKUP_RESOURCES }
