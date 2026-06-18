import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

import styles from '@/components/ui/Toast/Toast.module.css'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastOptions {
  message: string
  variant?: ToastVariant
  durationMs?: number
}

interface ToastItem extends Required<Pick<ToastOptions, 'message' | 'variant'>> {
  id: string
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const VARIANT_ICON = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
} as const

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div className={styles.viewport} aria-live="polite" aria-relevant="additions">
      {toasts.map((toast) => {
        const Icon = VARIANT_ICON[toast.variant]

        return (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.variant]}`} role="status">
            <span className={styles.iconWrap}>
              <Icon size={18} aria-hidden />
            </span>
            <p className={styles.message}>{toast.message}</p>
            <button
              type="button"
              className={styles.dismiss}
              onClick={() => onDismiss(toast.id)}
              aria-label="Fechar notificação"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({ message, variant = 'success', durationMs = 4500 }: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      setToasts((current) => [...current, { id, message, variant }])

      window.setTimeout(() => {
        dismissToast(id)
      }, durationMs)
    },
    [dismissToast],
  )

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider')
  }

  return context
}
