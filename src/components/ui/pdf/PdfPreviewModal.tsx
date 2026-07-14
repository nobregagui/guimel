import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { PdfActions } from '@/components/ui/pdf/PdfActions'
import { PdfViewer } from '@/components/ui/pdf/PdfViewer'
import styles from '@/components/ui/pdf/PdfPreview.module.css'

export interface PdfPreviewMetaItem {
  label: string
  value: ReactNode
  highlight?: boolean
}

interface PdfPreviewModalProps {
  open: boolean
  title: string
  subtitle?: string
  objectUrl: string | null
  isLoading?: boolean
  errorMessage?: string | null
  metaItems: PdfPreviewMetaItem[]
  canShare?: boolean
  onClose: () => void
  onPrint: () => void
  onDownload: () => void
  onShare?: () => void
}

const SIDEBAR_SELECTOR = '[data-GuiMe-sidebar]'
const MOBILE_BREAKPOINT = 768

/** Offset esquerdo do conteúdo útil (largura visível do sidebar desktop). */
function useSidebarContentInset(enabled: boolean) {
  const [inset, setInset] = useState(0)

  useEffect(() => {
    if (!enabled) return undefined

    function measure() {
      if (window.innerWidth <= MOBILE_BREAKPOINT) {
        setInset(0)
        return
      }

      const sidebar = document.querySelector(SIDEBAR_SELECTOR)
      if (!(sidebar instanceof HTMLElement)) {
        setInset(0)
        return
      }

      const rect = sidebar.getBoundingClientRect()
      // Sidebar fora da tela (mobile/off-canvas) → sem offset
      if (rect.right <= 0) {
        setInset(0)
        return
      }

      setInset(Math.max(0, Math.round(rect.right)))
    }

    measure()

    const sidebar = document.querySelector(SIDEBAR_SELECTOR)
    const resizeObserver =
      sidebar instanceof HTMLElement ? new ResizeObserver(measure) : null
    if (sidebar instanceof HTMLElement) resizeObserver?.observe(sidebar)

    const mutationObserver =
      sidebar instanceof HTMLElement ? new MutationObserver(measure) : null
    if (sidebar instanceof HTMLElement) {
      mutationObserver?.observe(sidebar, {
        attributes: true,
        attributeFilter: ['class', 'style'],
      })
    }

    window.addEventListener('resize', measure)
    return () => {
      resizeObserver?.disconnect()
      mutationObserver?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [enabled])

  return inset
}

export function PdfPreviewModal({
  open,
  title,
  objectUrl,
  isLoading = false,
  errorMessage = null,
  metaItems,
  canShare = false,
  onClose,
  onPrint,
  onDownload,
  onShare,
}: PdfPreviewModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const actionsDisabled = isLoading || Boolean(errorMessage) || !objectUrl
  const sidebarInset = useSidebarContentInset(open)

  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
        event.preventDefault()
        if (!actionsDisabled) onPrint()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    dialogRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [actionsDisabled, onClose, onPrint, open])

  if (!open) return null

  return createPortal(
    <div
      className={styles.modalRoot}
      role="presentation"
      style={{ ['--pdf-modal-inset' as string]: `${sidebarInset}px` }}
    >
      <button
        type="button"
        className={styles.modalOverlay}
        aria-label="Fechar preview"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className={styles.modalDialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className={styles.modalBody}>
          <div className={styles.previewPane}>
            <PdfViewer
              objectUrl={objectUrl}
              isLoading={isLoading}
              errorMessage={errorMessage}
              title={title}
            />
          </div>

          <aside className={styles.sidePane}>
            <div className={styles.sideHeader}>
              <h3 className={styles.sideTitle}>Informações da venda</h3>
            </div>
            <dl className={styles.metaList}>
              {metaItems.map((item) => (
                <div key={item.label} className={styles.metaItem}>
                  <dt>{item.label}</dt>
                  <dd className={item.highlight ? styles.metaHighlight : undefined}>{item.value}</dd>
                </div>
              ))}
            </dl>
            <div className={styles.modalFooter}>
              <PdfActions
                disabled={actionsDisabled}
                onPrint={onPrint}
                onDownload={onDownload}
                onShare={canShare ? onShare : undefined}
                onClose={onClose}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>,
    document.body,
  )
}
