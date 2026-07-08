import type { ReactNode } from 'react'

import { Loading } from '@/components/ui/Loading'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface FinanceiroQueryFeedbackProps {
  isLoading: boolean
  isError: boolean
  loadingLabel?: string
  onRetry?: () => void
  children: ReactNode
}

export function FinanceiroQueryFeedback({
  isLoading,
  isError,
  loadingLabel = 'Carregando dados financeiros...',
  onRetry,
  children,
}: FinanceiroQueryFeedbackProps) {
  if (isLoading) {
    return <Loading label={loadingLabel} layout="centered" />
  }

  if (isError) {
    return (
      <div className={styles.feedbackState}>
        <p>Não foi possível carregar os dados financeiros.</p>
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
