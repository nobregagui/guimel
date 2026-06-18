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

  const regimeLineClass = result.regimeTributario.isRegular
    ? styles.cnpjConsultaSuccess
    : styles.cnpjConsultaWarning

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

      <span className={`${styles.cnpjConsultaLine} ${styles.cnpjConsultaMuted}`}>
        Porte: {result.porteEmpresa}
      </span>

      <span className={`${styles.cnpjConsultaLine} ${regimeLineClass}`}>
        Regime tributário: {result.regimeTributario.label}
      </span>

      {result.regimeTributario.detalhe ? (
        <span className={`${styles.cnpjConsultaLine} ${styles.cnpjConsultaMuted}`}>
          {result.regimeTributario.detalhe}
        </span>
      ) : null}

      {result.regimeTributario.regime === 'simples_nacional' ? (
        <span
          className={`${styles.cnpjConsultaLine} ${
            result.simplesNacional.isRegular ? styles.cnpjConsultaSuccess : styles.cnpjConsultaMuted
          }`}
        >
          Simples Nacional: {result.simplesNacional.label}
        </span>
      ) : null}

      {result.regimeTributario.regime !== 'mei' && result.mei.label !== 'Sem informação de MEI' ? (
        <span
          className={`${styles.cnpjConsultaLine} ${
            result.mei.isOptante ? styles.cnpjConsultaSuccess : styles.cnpjConsultaMuted
          }`}
        >
          MEI: {result.mei.label}
        </span>
      ) : null}
    </div>
  )
}
