import { Download, Plus } from 'lucide-react'
import type { RefObject } from 'react'

import { FINANCEIRO_ABAS } from '@/features/financeiro/data/shared'
import type { FinanceiroAba, Periodo } from '@/features/financeiro/types'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface FinanceiroHeaderProps {
  periodo: Periodo
  abaAtiva: FinanceiroAba
  onPeriodoChange: (periodo: Periodo) => void
  onAbaChange: (aba: FinanceiroAba) => void
  primaryActionLabel?: string
  primaryActionRef?: RefObject<HTMLButtonElement | null>
  highlightPrimaryAction?: boolean
  onPrimaryAction?: () => void
}

export function FinanceiroHeader({
  periodo,
  abaAtiva,
  onPeriodoChange,
  onAbaChange,
  primaryActionLabel = 'Novo lançamento',
  primaryActionRef,
  highlightPrimaryAction = false,
  onPrimaryAction,
}: FinanceiroHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.headerTop}>
        <h2 className={styles.pageTitle}>Financeiro</h2>

        <div className={styles.headerActions}>
          <div className={styles.periodoSelector}>
            {(['7d', 'mes', 'ano'] as Periodo[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onPeriodoChange(p)}
                className={`${styles.periodoBtn} ${periodo === p ? styles.periodoBtnActive : ''}`}
              >
                {p === '7d' ? '7 dias' : p === 'mes' ? 'Mês' : 'Ano'}
              </button>
            ))}
          </div>

          <button type="button" className={styles.btnSecondary}>
            <Download size={13} /> Exportar
          </button>

          <button
            ref={primaryActionRef}
            type="button"
            className={`${styles.btnPrimary} ${highlightPrimaryAction ? styles.btnPrimaryHighlight : ''}`}
            onClick={onPrimaryAction}
          >
            <Plus size={13} /> {primaryActionLabel}
          </button>
        </div>
      </div>

      <nav className={styles.tabs} aria-label="Seções do financeiro">
        {FINANCEIRO_ABAS.map((aba) => (
          <button
            key={aba.id}
            type="button"
            onClick={() => onAbaChange(aba.id)}
            className={`${styles.tab} ${abaAtiva === aba.id ? styles.tabActive : ''}`}
          >
            {aba.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
