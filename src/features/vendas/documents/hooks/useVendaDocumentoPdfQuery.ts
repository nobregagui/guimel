import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import { pedidoService } from '@/services/pedido.service'
import type { VendaDocumentoTipo } from '@/features/vendas/documents/types'
import { getDocumentoFilename } from '@/features/vendas/documents/documentDefinitions'

export const vendaDocumentoQueryKeys = {
  all: ['venda-documentos'] as const,
  pdf: (id: string, tipo: VendaDocumentoTipo) =>
    [...vendaDocumentoQueryKeys.all, id, tipo] as const,
}

export type VendaPdfQueryErrorKind = 'unavailable' | 'failed'

export function getVendaPdfErrorKind(error: unknown): VendaPdfQueryErrorKind {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    if (status === 404 || status === 204) return 'unavailable'
    return 'failed'
  }

  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    typeof (error as { response?: { status?: number } }).response?.status === 'number'
  ) {
    const status = (error as { response: { status: number } }).response.status
    if (status === 404 || status === 204) return 'unavailable'
  }

  return 'failed'
}

export function useVendaDocumentoPdfQuery(
  pedidoId: string | undefined,
  tipo: VendaDocumentoTipo | null,
  numero: string,
  enabled: boolean,
) {
  // exportar compartilha o mesmo PDF de pedido no backend
  const cacheTipo: VendaDocumentoTipo | null =
    tipo === 'exportar' ? 'pedido' : tipo

  return useQuery({
    queryKey: vendaDocumentoQueryKeys.pdf(pedidoId ?? '', cacheTipo ?? 'pedido'),
    queryFn: async () => {
      const blob = await pedidoService.getDocumentoPdf(pedidoId!, tipo!)
      const objectUrl = URL.createObjectURL(blob)
      return {
        blob,
        objectUrl,
        filename: getDocumentoFilename(tipo!, numero),
      }
    },
    enabled: Boolean(enabled && pedidoId && tipo && tipo !== 'danfe'),
    staleTime: 0,
    gcTime: 0,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}
