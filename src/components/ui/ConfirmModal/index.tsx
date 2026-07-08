import { useEffect } from 'react'
import { AlertTriangle, Info, X } from 'lucide-react'
import clsx from 'clsx'

import { LoadingButtonContent } from '@/components/ui/Loading'
import styles from '@/components/ui/ConfirmModal/ConfirmModal.module.css'

export type ConfirmModalVariant = 'danger' | 'warning' | 'info'

export interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  variant?: ConfirmModalVariant
  confirmLabel?: string
  cancelLabel?: string
  confirmingLabel?: string
  isConfirming?: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
}

const VARIANT_ICON_CLASS: Record<ConfirmModalVariant, string> = {
  danger: styles.iconDanger,
  warning: styles.iconWarning,
  info: styles.iconInfo,
}

export function ConfirmModal({
  open,
  title,
  description,
  variant = 'danger',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmingLabel = 'Processando...',
  isConfirming = false,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return undefined

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isConfirming) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, isConfirming, onClose])

  if (!open) return null

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.overlay}
        onClick={isConfirming ? undefined : onClose}
        aria-label="Fechar"
        disabled={isConfirming}
      />

      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
      >
        <div className={clsx(styles.iconWrap, VARIANT_ICON_CLASS[variant])}>
          {variant === 'info' ? <Info size={20} /> : <AlertTriangle size={20} />}
        </div>

        <div className={styles.content}>
          <h3 id="confirm-modal-title" className={styles.title}>
            {title}
          </h3>
          <p id="confirm-modal-description" className={styles.description}>
            {description}
          </p>
        </div>

        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          disabled={isConfirming}
          aria-label="Fechar"
        >
          <X size={16} />
        </button>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onClose}
            disabled={isConfirming}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={styles.btnDanger}
            onClick={() => void onConfirm()}
            disabled={isConfirming}
          >
            <LoadingButtonContent
              loading={isConfirming}
              loadingLabel={confirmingLabel}
              idleLabel={confirmLabel}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
