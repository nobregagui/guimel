import { useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { PdfPreviewModal } from '@/components/ui/pdf'
import { useToast } from '@/components/ui/Toast'
import {
  buildVendaDocumentoMeta,
  getDocumentoTitle,
} from '@/features/vendas/documents/documentDefinitions'
import {
  getVendaPdfErrorKind,
  useVendaDocumentoPdfQuery,
  vendaDocumentoQueryKeys,
} from '@/features/vendas/documents/hooks/useVendaDocumentoPdfQuery'
import type { VendaDocumentoTipo } from '@/features/vendas/documents/types'
import type { Pedido } from '@/features/vendas/types'
import { formatarData, formatarMoeda } from '@/features/vendas/data/shared'

interface VendaDocumentoPreviewProps {
  open: boolean
  pedido: Pedido
  tipo: VendaDocumentoTipo | null
  onClose: () => void
}

export function VendaDocumentoPreview({
  open,
  pedido,
  tipo,
  onClose,
}: VendaDocumentoPreviewProps) {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const query = useVendaDocumentoPdfQuery(pedido.id, tipo, pedido.numero, open && Boolean(tipo))

  useEffect(() => {
    return () => {
      if (query.data?.objectUrl) {
        URL.revokeObjectURL(query.data.objectUrl)
      }
    }
  }, [query.data?.objectUrl])

  const meta = useMemo(() => buildVendaDocumentoMeta(pedido), [pedido])

  const errorMessage = useMemo(() => {
    if (!query.isError) return null
    return getVendaPdfErrorKind(query.error) === 'unavailable'
      ? 'Documento ainda não disponível.'
      : 'Não foi possível gerar o documento.'
  }, [query.error, query.isError])

  async function handleDownload() {
    if (!query.data) return
    const anchor = document.createElement('a')
    anchor.href = query.data.objectUrl
    anchor.download = query.data.filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }

  function handlePrint() {
    if (!query.data?.objectUrl) return
    const printWindow = window.open(query.data.objectUrl, '_blank', 'noopener,noreferrer')
    if (!printWindow) {
      showToast({
        message: 'Permita pop-ups para imprimir o documento.',
        variant: 'error',
      })
      return
    }
    printWindow.addEventListener('load', () => {
      printWindow.focus()
      printWindow.print()
    })
  }

  async function handleShare() {
    if (!query.data) return

    try {
      const file = new File([query.data.blob], query.data.filename, {
        type: 'application/pdf',
      })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: getDocumentoTitle(tipo ?? 'pedido'),
          files: [file],
        })
        return
      }

      await handleDownload()
      showToast({
        message: 'Compartilhamento não suportado neste dispositivo. Download iniciado.',
        variant: 'info',
      })
    } catch {
      showToast({
        message: 'Não foi possível compartilhar o documento.',
        variant: 'error',
      })
    }
  }

  function handleClose() {
    if (query.data?.objectUrl) {
      URL.revokeObjectURL(query.data.objectUrl)
    }
    if (pedido.id && tipo) {
      const cacheTipo = tipo === 'exportar' ? 'pedido' : tipo
      queryClient.removeQueries({ queryKey: vendaDocumentoQueryKeys.pdf(pedido.id, cacheTipo) })
    }
    onClose()
  }

  const canShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function'

  return (
    <PdfPreviewModal
      open={open && Boolean(tipo)}
      title={tipo ? getDocumentoTitle(tipo) : 'Documento'}
      subtitle={`${pedido.numero} · ${pedido.clienteNome}`}
      objectUrl={query.data?.objectUrl ?? null}
      isLoading={query.isFetching || query.isLoading}
      errorMessage={errorMessage}
      canShare={canShare}
      onClose={handleClose}
      onPrint={handlePrint}
      onDownload={() => void handleDownload()}
      onShare={() => void handleShare()}
      metaItems={[
        { label: 'Cliente', value: meta.clienteNome },
        { label: 'Número', value: meta.numero },
        { label: 'Data', value: formatarData(meta.dataIso) },
        { label: 'Vendedor', value: meta.vendedorNome ?? '—' },
        { label: 'Status', value: meta.statusLabel },
        { label: 'Valor', value: formatarMoeda(meta.total), highlight: true },
        { label: 'Quantidade de Itens', value: String(meta.quantidadeItens) },
        {
          label: 'Peso Total',
          value: meta.pesoTotal != null ? `${meta.pesoTotal.toLocaleString('pt-BR')} kg` : '—',
        },
      ]}
    />
  )
}
