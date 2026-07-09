import { Download, Plus, RefreshCw, Upload } from 'lucide-react'
import type { RefObject } from 'react'

import { PermissionGate } from '@/components/auth/PermissionGate'
import { MODULE_WRITE_PERMISSIONS } from '@/constants/permissions'
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
  onExport?: () => void
  onImport?: () => void
  onRefresh?: () => void
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
  onExport,
  onImport,
  onRefresh,
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

          <div className={styles.toolbarActions}>
            {onImport ? (
              <PermissionGate permission="conciliacao:import" requireWrite>
                <button type="button" className={styles.btnSecondary} onClick={onImport}>
                  <Upload size={13} /> Importar
                </button>
              </PermissionGate>
            ) : null}
            <PermissionGate permission="relatorios:export">
              <button type="button" className={styles.btnSecondary} onClick={onExport}>
                <Download size={13} /> Exportar
              </button>
            </PermissionGate>
            {onRefresh ? (
              <button type="button" className={styles.btnSecondary} onClick={onRefresh} aria-label="Atualizar">
                <RefreshCw size={13} />
              </button>
            ) : null}
          </div>

          <PermissionGate permissions={[...MODULE_WRITE_PERMISSIONS.financeiro]} requireWrite>
            <button
              ref={primaryActionRef}
              type="button"
              className={`${styles.btnPrimary} ${highlightPrimaryAction ? styles.btnPrimaryHighlight : ''}`}
              onClick={onPrimaryAction}
            >
              <Plus size={13} /> {primaryActionLabel}
            </button>
          </PermissionGate>
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
