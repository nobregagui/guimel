import type { CnpjConsultaResult } from '@/services/opencnpj.service'
import styles from '@/pages/clientes/ClientesPage.module.css'

interface CnpjConsultaStatusProps {
  result: CnpjConsultaResult
}

export function CnpjConsultaStatus({ result }: CnpjConsultaStatusProps) {
  if (result.status === 'idle') return null

  if (result.status === 'loading') {
    return (
      <div className={styles.cnpjConsulta} aria-live="polite">
        <span className={`${styles.cnpjConsultaLine} ${styles.cnpjConsultaMuted}`}>
          Consultando CNPJ na OpenCNPJ...
        </span>
      </div>
    )
  }

  if (result.status === 'not_found') {
    return null
  }

  if (result.status === 'error') {
    return (
      <div className={styles.cnpjConsulta} aria-live="polite">
        <span className={`${styles.cnpjConsultaLine} ${styles.cnpjConsultaMuted}`}>{result.message}</span>
      </div>
    )
  }

  return (
    <div className={styles.cnpjConsulta} aria-live="polite">
      <span className={`${styles.cnpjConsultaLine} ${styles.cnpjConsultaSuccess}`}>CNPJ encontrado</span>
      <span
        className={`${styles.cnpjConsultaLine} ${
          result.cadastroRegular ? styles.cnpjConsultaSuccess : styles.cnpjConsultaWarning
        }`}
      >
        Situação cadastral: {result.situacaoCadastral}
        {result.cadastroRegular ? ' — regular' : ' — irregular'}
      </span>
      <span
        className={`${styles.cnpjConsultaLine} ${
          result.simplesNacional.isRegular ? styles.cnpjConsultaSuccess : styles.cnpjConsultaMuted
        }`}
      >
        Simples Nacional: {result.simplesNacional.label}
      </span>
    </div>
  )
}
