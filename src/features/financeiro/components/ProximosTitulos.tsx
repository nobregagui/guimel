import type { ContaTituloBase } from '@/features/financeiro/types'
import { StatusBadge } from '@/features/financeiro/components/StatusBadge'
import { formatBRL } from '@/features/financeiro/utils'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface ProximosTitulosProps<T extends ContaTituloBase> {
  titulos: T[]
  getLabel: (titulo: T) => string
  valorClassName?: string
  title?: string
  hint?: string
}

export function ProximosTitulos<T extends ContaTituloBase>({
  titulos,
  getLabel,
  valorClassName = styles.cellValorNeg,
  title = 'Próximos vencimentos',
  hint = 'Prioridade',
}: ProximosTitulosProps<T>) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <span className={styles.categoryHint}>{hint}</span>
      </div>
      <div className={styles.vencimentosList}>
        {titulos.map((titulo) => (
          <div key={titulo.id} className={styles.vencimentoItem}>
            <div className={styles.vencimentoInfo}>
              <p className={styles.cellDescricao}>{getLabel(titulo)}</p>
              <p className={styles.cellSubDesc}>{titulo.vencimento}</p>
            </div>
            <div className={styles.vencimentoRight}>
              <span className={valorClassName}>{formatBRL(titulo.valor)}</span>
              <StatusBadge status={titulo.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
