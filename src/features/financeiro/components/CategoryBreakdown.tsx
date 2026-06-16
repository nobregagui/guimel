import { formatBRL } from '@/features/financeiro/utils'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface CategoryBreakdownProps {
  items: { categoria: string; total: number; quantidade: number }[]
  title?: string
  hint?: string
}

export function CategoryBreakdown({
  items,
  title = 'Despesas por categoria',
  hint = 'Em aberto',
}: CategoryBreakdownProps) {
  const maxTotal = items[0]?.total ?? 1

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <span className={styles.categoryHint}>{hint}</span>
      </div>

      <div className={styles.categoryList}>
        {items.map((item) => (
          <div key={item.categoria} className={styles.categoryRow}>
            <div className={styles.categoryRowTop}>
              <span className={styles.categoryName}>{item.categoria}</span>
              <span className={styles.categoryMeta}>
                {item.quantidade} {item.quantidade === 1 ? 'título' : 'títulos'}
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
