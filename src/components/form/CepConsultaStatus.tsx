import type { CepConsultaResult } from '@/services/viacep.service'
import styles from '@/components/form/EnderecoFields.module.css'

interface CepConsultaStatusProps {
  result: CepConsultaResult
}

export function CepConsultaStatus({ result }: CepConsultaStatusProps) {
  if (result.status === 'idle') return null

  if (result.status === 'loading') {
    return (
      <span className={`${styles.cepStatus} ${styles.cepStatusMuted}`} aria-live="polite">
        Consultando CEP...
      </span>
    )
  }

  if (result.status === 'found') {
    return (
      <span className={`${styles.cepStatus} ${styles.cepStatusSuccess}`} aria-live="polite">
        CEP encontrado — endereço preenchido automaticamente
      </span>
    )
  }

  if (result.status === 'not_found') {
    return (
      <span className={`${styles.cepStatus} ${styles.cepStatusError}`} aria-live="polite">
        CEP não encontrado
      </span>
    )
  }

  return (
    <span className={`${styles.cepStatus} ${styles.cepStatusError}`} aria-live="polite">
      {result.message}
    </span>
  )
}
