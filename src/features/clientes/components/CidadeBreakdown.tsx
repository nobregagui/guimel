import { MapPin } from 'lucide-react'

import type { CidadeSummary } from '@/features/clientes/types'
import { formatBRL } from '@/features/clientes/utils'
import styles from '@/pages/clientes/ClientesPage.module.css'

interface CidadeBreakdownProps {
  items: CidadeSummary[]
  title?: string
  hint?: string
}

export function CidadeBreakdown({
  items,
  title = 'Clientes por região',
  hint = 'Distribuição geográfica',
}: CidadeBreakdownProps) {
  const maxVendas = items[0]?.totalVendas ?? 1

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <span className={styles.categoryHint}>{hint}</span>
      </div>

      <div className={styles.cidadeList}>
        {items.map((item) => (
          <div key={`${item.cidade}-${item.estado}`} className={styles.cidadeItem}>
            <div className={styles.cidadeItemTop}>
              <span className={styles.cidadeNome}>
                <MapPin size={12} /> {item.cidade}, {item.estado}
              </span>
              <span className={styles.categoryMeta}>
                {item.quantidade} {item.quantidade === 1 ? 'cliente' : 'clientes'}
              </span>
            </div>
            <div className={styles.categoryRowBottom}>
              <div className={styles.categoryTrack}>
                <div
                  className={styles.categoryFill}
                  style={{ width: `${(item.totalVendas / maxVendas) * 100}%` }}
                />
              </div>
              <span className={styles.categoryValue}>{formatBRL(item.totalVendas)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
