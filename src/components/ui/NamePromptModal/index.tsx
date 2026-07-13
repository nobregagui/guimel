import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus, X } from 'lucide-react'

import { LoadingButtonContent } from '@/components/ui/Loading'
import styles from '@/components/ui/NamePromptModal/NamePromptModal.module.css'

export interface NamePromptModalProps {
  open: boolean
  title: string
  description: string
  inputLabel?: string
  inputPlaceholder?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmingLabel?: string
  isConfirming?: boolean
  initialValue?: string
  onClose: () => void
  onConfirm: (nome: string) => void | Promise<void>
}

export function NamePromptModal({
  open,
  title,
  description,
  inputLabel = 'Nome',
  inputPlaceholder = 'Digite o nome',
  confirmLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  confirmingLabel = 'Salvando...',
  isConfirming = false,
  initialValue = '',
  onClose,
  onConfirm,
}: NamePromptModalProps) {
  const titleId = useId()
  const descriptionId = useId()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [nome, setNome] = useState(initialValue)
  const [touched, setTouched] = useState(false)

  const trimmed = nome.trim()
  const showError = touched && !trimmed

  useEffect(() => {
    if (!open) return
    setNome(initialValue)
    setTouched(false)
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30)
    return () => window.clearTimeout(timer)
  }, [open, initialValue])

  useEffect(() => {
    if (!open) return undefined

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || isConfirming) return
      event.preventDefault()
      event.stopImmediatePropagation()
      onClose()
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [open, isConfirming, onClose])

  async function handleConfirm() {
    setTouched(true)
    if (!trimmed || isConfirming) return
    await onConfirm(trimmed)
  }

  if (!open) return null

  return createPortal(
    <div className={styles.root} data-name-prompt-modal="true">
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
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className={styles.iconWrap}>
          <Plus size={20} />
        </div>

        <div className={styles.content}>
          <h3 id={titleId} className={styles.title}>
            {title}
          </h3>
          <p id={descriptionId} className={styles.description}>
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

        <div className={styles.form}>
          <div className={styles.field}>
            <label htmlFor={inputId}>{inputLabel}</label>
            <input
              ref={inputRef}
              id={inputId}
              value={nome}
              placeholder={inputPlaceholder}
              disabled={isConfirming}
              maxLength={120}
              aria-invalid={showError}
              onChange={(event) => setNome(event.target.value)}
              onBlur={() => setTouched(true)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  event.stopPropagation()
                  void handleConfirm()
                }
              }}
            />
            {showError ? <span className={styles.fieldError}>Informe um nome.</span> : null}
          </div>

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
              className={styles.btnPrimary}
              onClick={() => void handleConfirm()}
              disabled={isConfirming || !trimmed}
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
    </div>,
    document.body,
  )
}
