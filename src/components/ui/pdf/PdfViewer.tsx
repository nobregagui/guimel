import styles from '@/components/ui/pdf/PdfPreview.module.css'

interface PdfViewerProps {
  objectUrl: string | null
  isLoading?: boolean
  errorMessage?: string | null
  title?: string
}

export function PdfViewer({
  objectUrl,
  isLoading = false,
  errorMessage = null,
  title = 'Pré-visualização do PDF',
}: PdfViewerProps) {
  if (isLoading) {
    return (
      <div className={styles.viewer} role="status" aria-live="polite" aria-busy="true">
        <div className={styles.overlay}>
          <div className={styles.skeleton} aria-hidden />
          <p className={styles.overlayTitle}>Gerando PDF...</p>
          <p className={styles.overlayText}>Aguarde enquanto o documento é preparado.</p>
          <span className={styles.srOnly}>Gerando PDF, aguarde.</span>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className={styles.viewer} role="alert">
        <div className={styles.overlay}>
          <p className={styles.overlayTitle}>{errorMessage}</p>
          <p className={styles.overlayText}>
            Tente novamente em instantes ou escolha outro documento.
          </p>
        </div>
      </div>
    )
  }

  if (!objectUrl) {
    return (
      <div className={styles.viewer}>
        <div className={styles.overlay}>
          <p className={styles.overlayTitle}>Selecione um documento</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.viewer}>
      <iframe title={title} src={objectUrl} className={styles.frame} />
    </div>
  )
}
