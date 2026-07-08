import type { ReactNode } from 'react'

import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface FinanceiroBulkBarProps {
  selectedCount: number
  onClear: () => void
  children: ReactNode
}

export function FinanceiroBulkBar({ selectedCount, onClear, children }: FinanceiroBulkBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className={styles.bulkBar}>
      <span className={styles.bulkBarInfo}>
        {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
      </span>
      <div className={styles.bulkBarActions}>{children}</div>
      <button type="button" className={styles.bulkBarClear} onClick={onClear}>
        Limpar seleção
      </button>
    </div>
  )
}
