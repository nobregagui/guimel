import type { ReactNode } from 'react'

import { Loading } from '@/components/ui/Loading'
import styles from '@/pages/clientes/ClientesPage.module.css'

interface ClientesQueryFeedbackProps {
  isLoading: boolean
  isError: boolean
  loadingLabel?: string
  onRetry?: () => void
  children: ReactNode
}

export function ClientesQueryFeedback({
  isLoading,
  isError,
  loadingLabel = 'Carregando clientes...',
  onRetry,
  children,
}: ClientesQueryFeedbackProps) {
  if (isLoading) {
    return <Loading label={loadingLabel} layout="centered" />
  }

  if (isError) {
    return (
      <div className={styles.feedbackState}>
        <p>Não foi possível carregar os clientes.</p>
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
