import { ArrowRight } from 'lucide-react'

import { ContaIcon } from '@/features/financeiro/components/ContaIcon'
import type { ContaBancaria } from '@/features/financeiro/types'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface TransferenciaRotaProps {
  origem: ContaBancaria | undefined
  destino: ContaBancaria | undefined
}

export function TransferenciaRota({ origem, destino }: TransferenciaRotaProps) {
  return (
    <div className={styles.transferenciaRota}>
      <span className={styles.transferenciaContaChip}>
        {origem ? <ContaIcon banco={origem.banco} /> : null}
        <span className={styles.transferenciaContaNome}>{origem?.nome ?? '—'}</span>
      </span>
      <ArrowRight size={14} className={styles.transferenciaSeta} aria-hidden />
      <span className={styles.transferenciaContaChip}>
        {destino ? <ContaIcon banco={destino.banco} /> : null}
        <span className={styles.transferenciaContaNome}>{destino?.nome ?? '—'}</span>
      </span>
    </div>
  )
}
