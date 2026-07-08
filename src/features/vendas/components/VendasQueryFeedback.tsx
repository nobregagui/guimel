import type { ReactNode } from 'react'

import { Loading } from '@/components/ui/Loading'
import styles from '@/pages/vendas/VendasPage.module.css'

interface VendasQueryFeedbackProps {
  isLoading: boolean
  isError: boolean
  loadingLabel?: string
  onRetry?: () => void
  children: ReactNode
}

export function VendasQueryFeedback({
  isLoading,
  isError,
  loadingLabel = 'Carregando pedidos...',
  onRetry,
  children,
}: VendasQueryFeedbackProps) {
  if (isLoading) {
    return <Loading label={loadingLabel} layout="centered" />
  }

  if (isError) {
    return (
      <div className={styles.feedbackState}>
        <p>Não foi possível carregar os pedidos.</p>
        {onRetry ? (
          <button type="button" className={styles.btnSecondary} onClick={onRetry}>
            Tentar novamente
          </button>
        ) : null}
      </div>
    )
  }

  return children
}
