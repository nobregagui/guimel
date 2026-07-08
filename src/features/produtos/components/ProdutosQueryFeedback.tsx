import type { ReactNode } from 'react'

import { Loading } from '@/components/ui/Loading'
import styles from '@/pages/produtos/ProdutosPage.module.css'

interface ProdutosQueryFeedbackProps {
  isLoading: boolean
  isError: boolean
  loadingLabel?: string
  onRetry?: () => void
  children: ReactNode
}

export function ProdutosQueryFeedback({
  isLoading,
  isError,
  loadingLabel = 'Carregando produtos...',
  onRetry,
  children,
}: ProdutosQueryFeedbackProps) {
  if (isLoading) {
    return <Loading label={loadingLabel} layout="centered" />
  }

  if (isError) {
    return (
      <div className={styles.feedbackState}>
        <p>Não foi possível carregar os produtos.</p>
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
