import { formatBRL } from '@/features/clientes/utils'
import styles from '@/pages/clientes/ClientesPage.module.css'

interface SegmentoBreakdownProps {
  items: { segmento: string; total: number; quantidade: number; percentual: number }[]
  title?: string
  hint?: string
}

export function SegmentoBreakdown({
  items,
  title = 'Receita por segmento',
  hint = 'Baseado em vendas acumuladas',
}: SegmentoBreakdownProps) {
  const maxTotal = items[0]?.total ?? 1

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <span className={styles.categoryHint}>{hint}</span>
      </div>

      <div className={styles.categoryList}>
        {items.map((item) => (
          <div key={item.segmento} className={styles.categoryRow}>
            <div className={styles.categoryRowTop}>
              <span className={styles.categoryName}>{item.segmento}</span>
              <span className={styles.categoryMeta}>
                {item.quantidade} {item.quantidade === 1 ? 'cliente' : 'clientes'} · {item.percentual}%
              </span>
            </div>
            <div className={styles.categoryRowBottom}>
              <div className={styles.categoryTrack}>
                <div
                  className={styles.categoryFill}
                  style={{ width: `${(item.total / maxTotal) * 100}%` }}
                />
              </div>
              <span className={styles.categoryValue}>{formatBRL(item.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
