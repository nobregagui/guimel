import { DocumentDropdown } from '@/features/vendas/documents/components/DocumentDropdown'
import type { VendaDocumentoOption, VendaDocumentoTipo } from '@/features/vendas/documents/types'

interface DocumentButtonProps {
  options: VendaDocumentoOption[]
  onSelect: (tipo: VendaDocumentoTipo) => void
  label?: string
  variant?: 'default' | 'ghost'
  ariaLabel?: string
}

/** Botão + dropdown de documentos de venda. */
export function DocumentButton({
  options,
  onSelect,
  label = 'Documentos',
  variant = 'default',
  ariaLabel,
}: DocumentButtonProps) {
  return (
    <DocumentDropdown
      options={options}
      onSelect={onSelect}
      label={label}
      variant={variant}
      ariaLabel={ariaLabel}
    />
  )
}
