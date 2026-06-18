import { SlidersHorizontal } from 'lucide-react'

import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface FinanceiroTableFiltersButtonProps {
  open: boolean
  activeCount: number
  controlsId: string
  onToggle: () => void
}

export function FinanceiroTableFiltersButton({
  open,
  activeCount,
  controlsId,
  onToggle,
}: FinanceiroTableFiltersButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.btnSecondary} ${activeCount > 0 ? styles.btnSecondaryActive : ''}`}
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controlsId}
    >
      <SlidersHorizontal size={12} />
      Filtros{activeCount > 0 ? ` (${activeCount})` : ''}
    </button>
  )
}
