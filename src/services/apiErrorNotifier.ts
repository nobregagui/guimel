import type { ToastOptions } from '@/components/ui/Toast'
import { NETWORK_ERROR_MESSAGE } from '@/utils/apiErrors'

type ToastNotifier = (options: ToastOptions) => void

let notifier: ToastNotifier | null = null
let lastNetworkToastAt = 0
let lastForbiddenToastAt = 0

const TOAST_DEBOUNCE_MS = 4_000

export function registerApiErrorNotifier(showToast: ToastNotifier): void {
  notifier = showToast
}

export function unregisterApiErrorNotifier(): void {
  notifier = null
}

export function notifyApiNetworkError(message = NETWORK_ERROR_MESSAGE): void {
  const now = Date.now()
  if (now - lastNetworkToastAt < TOAST_DEBOUNCE_MS) return
  lastNetworkToastAt = now
  notifier?.({ message, variant: 'error', durationMs: 6_000 })
}

export function notifyApiForbiddenError(message = 'Acesso restrito.'): void {
  const now = Date.now()
  if (now - lastForbiddenToastAt < TOAST_DEBOUNCE_MS) return
  lastForbiddenToastAt = now
  notifier?.({ message, variant: 'error', durationMs: 5_000 })
}
