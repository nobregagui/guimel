import styles from '@/components/ui/pdf/PdfPreview.module.css'

interface PdfActionsProps {
  disabled?: boolean
  onPrint: () => void
  onDownload: () => void
  onShare?: () => void
  onClose: () => void
  className?: {
    btn?: string
    btnPrimary?: string
    btnGhost?: string
  }
}

export function PdfActions({
  disabled = false,
  onPrint,
  onDownload,
  onShare,
  onClose,
  className,
}: PdfActionsProps) {
  return (
    <>
      <button
        type="button"
        className={className?.btn ?? styles.btn}
        disabled={disabled}
        onClick={onPrint}
      >
        Imprimir
      </button>
      <button
        type="button"
        className={className?.btnPrimary ?? styles.btnPrimary}
        disabled={disabled}
        onClick={onDownload}
      >
        Baixar PDF
      </button>
      {onShare ? (
        <button
          type="button"
          className={className?.btn ?? styles.btn}
          disabled={disabled}
          onClick={onShare}
        >
          Compartilhar
        </button>
      ) : null}
      <button type="button" className={className?.btnGhost ?? styles.btnGhost} onClick={onClose}>
        Fechar
      </button>
    </>
  )
}
