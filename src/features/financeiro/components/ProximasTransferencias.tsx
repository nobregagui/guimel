import { CalendarClock } from 'lucide-react'

import { TransferenciaRota } from '@/features/financeiro/components/TransferenciaRota'
import type { ContaBancaria, Transferencia } from '@/features/financeiro/types'
import { formatBRL } from '@/features/financeiro/utils'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface ProximasTransferenciasProps {
  transferencias: Transferencia[]
  contas: ContaBancaria[]
}

export function ProximasTransferencias({ transferencias, contas }: ProximasTransferenciasProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>Próximas transferências</h3>
        <span className={styles.categoryHint}>Agendadas</span>
      </div>

      {transferencias.length === 0 ? (
        <p className={styles.emptyState}>Nenhuma transferência agendada no período.</p>
      ) : (
        <div className={styles.vencimentosList}>
          {transferencias.map((transferencia) => {
            const origem = contas.find((c) => c.id === transferencia.contaOrigemId)
            const destino = contas.find((c) => c.id === transferencia.contaDestinoId)

            return (
              <div key={transferencia.id} className={styles.vencimentoItem}>
                <div className={styles.vencimentoInfo}>
                  <p className={styles.cellDescricao}>{transferencia.descricao}</p>
                  <TransferenciaRota origem={origem} destino={destino} />
                </div>
                <div className={styles.vencimentoRight}>
                  <span className={styles.cellValorNeg}>{formatBRL(transferencia.valor)}</span>
                  <span className={styles.formaPagamento}>
                    <CalendarClock size={11} /> {transferencia.data}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
