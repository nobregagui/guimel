import type { ToastOptions } from '@/components/ui/Toast'
import { NETWORK_ERROR_MESSAGE } from '@/utils/apiErrors'

type ToastNotifier = (options: ToastOptions) => void

let notifier: ToastNotifier | null = null
let lastNetworkToastAt = 0

const NETWORK_TOAST_DEBOUNCE_MS = 4_000

export function registerApiErrorNotifier(showToast: ToastNotifier): void {
  notifier = showToast
}

export function unregisterApiErrorNotifier(): void {
  notifier = null
}

export function notifyApiNetworkError(message = NETWORK_ERROR_MESSAGE): void {
  const now = Date.now()
  if (now - lastNetworkToastAt < NETWORK_TOAST_DEBOUNCE_MS) return

  lastNetworkToastAt = now
  notifier?.({ message, variant: 'error', durationMs: 6_000 })
}
