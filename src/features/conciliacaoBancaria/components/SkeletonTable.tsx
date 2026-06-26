import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

interface SkeletonTableProps {
  rows?: number
  columns?: number
}

export function SkeletonTable({ rows = 8, columns = 5 }: SkeletonTableProps) {
  const colWidths = ['32px', '1fr', '80px', '90px', '70px', '30px']

  return (
    <div className={styles.skeletonTable} aria-busy="true" aria-label="Carregando dados...">
      {/* Header skeleton */}
      <div className={styles.skeletonRow} style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' }}>
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className={styles.skeletonCell}
            style={{
              width: colWidths[i] ?? '1fr',
              height: '10px',
              flex: colWidths[i] === '1fr' ? 1 : undefined,
            }}
          />
        ))}
      </div>

      {/* Body rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className={styles.skeletonRow}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={colIdx}
              className={`${styles.skeletonCell} ${styles.skeletonAnimate}`}
              style={{
                width: colWidths[colIdx] === '1fr' ? undefined : colWidths[colIdx],
                flex: colWidths[colIdx] === '1fr' ? 1 : undefined,
                height: colIdx === 1 ? undefined : '10px',
              }}
            >
              {colIdx === 1 ? (
                <>
                  <div className={`${styles.skeletonCell} ${styles.skeletonAnimate}`} style={{ height: '11px', marginBottom: '5px', width: `${55 + (rowIdx * 7) % 30}%` }} />
                  <div className={`${styles.skeletonCell} ${styles.skeletonAnimate}`} style={{ height: '9px', width: `${30 + (rowIdx * 5) % 25}%` }} />
                </>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

interface SkeletonKpiProps {
  count?: number
}

export function SkeletonKpiCards({ count = 4 }: SkeletonKpiProps) {
  return (
    <div className={styles.kpiGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.kpiCard} aria-busy="true">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div className={`${styles.skeletonCell} ${styles.skeletonAnimate}`} style={{ height: 10, width: '45%' }} />
            <div className={`${styles.skeletonCell} ${styles.skeletonAnimate}`} style={{ width: 36, height: 36, borderRadius: 10 }} />
          </div>
          <div className={`${styles.skeletonCell} ${styles.skeletonAnimate}`} style={{ height: 24, width: '60%', marginBottom: 6 }} />
          <div className={`${styles.skeletonCell} ${styles.skeletonAnimate}`} style={{ height: 9, width: '35%' }} />
        </div>
      ))}
    </div>
  )
}
