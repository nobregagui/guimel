import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

import type { ExtratoResumoFinanceiro } from '@/features/financeiro/utils'
import { formatBRL } from '@/features/financeiro/utils'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface ExtratoResumoCardProps {
  resumo: ExtratoResumoFinanceiro
  contaLabel: string
}

export function ExtratoResumoCard({ resumo, contaLabel }: ExtratoResumoCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Resumo do período</h3>
        <span className={styles.categoryHint}>{contaLabel}</span>
      </div>

      <div className={styles.extratoResumoList}>
        <div className={styles.extratoResumoItem}>
          <span className={styles.extratoResumoLabel}>
            <ArrowDownLeft size={14} className={styles.extratoIconEntrada} />
            Entradas
          </span>
          <span className={styles.cellValorPos}>{formatBRL(resumo.entradas)}</span>
        </div>

        <div className={styles.extratoResumoItem}>
          <span className={styles.extratoResumoLabel}>
            <ArrowUpRight size={14} className={styles.extratoIconSaida} />
            Saídas
          </span>
          <span className={styles.cellValorNeg}>{formatBRL(resumo.saidas)}</span>
        </div>

        <div className={styles.extratoResumoDivider} />

        <div className={styles.extratoResumoItem}>
          <span className={styles.extratoResumoLabelStrong}>Resultado líquido</span>
          <span className={resumo.liquido >= 0 ? styles.cellValorPos : styles.cellValorNeg}>
            {resumo.liquido >= 0 ? '+' : '−'} {formatBRL(Math.abs(resumo.liquido))}
          </span>
        </div>

        <div className={styles.extratoResumoItem}>
          <span className={styles.extratoResumoLabelStrong}>Saldo atual</span>
          <span className={styles.extratoSaldoAtual}>{formatBRL(resumo.saldoAtual)}</span>
        </div>
      </div>

      <p className={styles.extratoResumoFoot}>{resumo.quantidade} movimentações no período</p>
    </div>
  )
}
