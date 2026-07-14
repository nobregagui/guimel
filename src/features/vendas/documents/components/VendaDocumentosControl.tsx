import { useCallback, useMemo, useState } from 'react'

import { DocumentButton } from '@/features/vendas/documents/components/DocumentButton'
import { VendaDocumentoPreview } from '@/features/vendas/documents/components/VendaDocumentoPreview'
import { getVendaDocumentoOptions } from '@/features/vendas/documents/documentDefinitions'
import type { VendaDocumentoTipo } from '@/features/vendas/documents/types'
import type { Pedido } from '@/features/vendas/types'

interface VendaDocumentosControlProps {
  pedido: Pedido
  label?: string
  variant?: 'default' | 'ghost'
  ariaLabel?: string
}

export function VendaDocumentosControl({
  pedido,
  label,
  variant = 'default',
  ariaLabel,
}: VendaDocumentosControlProps) {
  const [tipoAtivo, setTipoAtivo] = useState<VendaDocumentoTipo | null>(null)
  const options = useMemo(() => getVendaDocumentoOptions(pedido), [pedido])

  const handleSelect = useCallback((tipo: VendaDocumentoTipo) => {
    setTipoAtivo(tipo)
  }, [])

  return (
    <>
      <DocumentButton
        options={options}
        onSelect={handleSelect}
        label={label}
        variant={variant}
        ariaLabel={ariaLabel ?? `Documentos de ${pedido.numero}`}
      />
      <VendaDocumentoPreview
        open={Boolean(tipoAtivo)}
        pedido={pedido}
        tipo={tipoAtivo}
        onClose={() => setTipoAtivo(null)}
      />
    </>
  )
}
