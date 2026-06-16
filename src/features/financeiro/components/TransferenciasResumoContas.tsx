import { ContaIcon } from '@/features/financeiro/components/ContaIcon'
import type { ContaBancaria } from '@/features/financeiro/types'
import type { TransferenciaContaResumo } from '@/features/financeiro/utils'
import { formatBRL } from '@/features/financeiro/utils'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface TransferenciasResumoContasProps {
  contas: ContaBancaria[]
  resumos: TransferenciaContaResumo[]
}

export function TransferenciasResumoContas({ contas, resumos }: TransferenciasResumoContasProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Movimentação interna</h3>
        <span className={styles.categoryHint}>Entradas e saídas por conta</span>
      </div>

      <div className={styles.transferenciaResumoList}>
        {resumos.map((resumo) => {
          const conta = contas.find((c) => c.id === resumo.contaId)
          if (!conta) return null

          return (
            <div key={resumo.contaId} className={styles.transferenciaResumoItem}>
              <div className={styles.transferenciaResumoTop}>
                <span className={styles.contaItemLeft}>
                  <ContaIcon banco={conta.banco} />
                  {conta.nome}
                </span>
                <span className={styles.categoryMeta}>{resumo.quantidade} mov.</span>
              </div>

              <div className={styles.transferenciaResumoValores}>
                <span className={styles.cellValorPos}>+ {formatBRL(resumo.entradas)}</span>
                <span className={styles.cellValorNeg}>− {formatBRL(resumo.saidas)}</span>
                <span className={resumo.liquido >= 0 ? styles.cellValorPos : styles.cellValorNeg}>
                  {resumo.liquido >= 0 ? '+' : '−'} {formatBRL(Math.abs(resumo.liquido))}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
