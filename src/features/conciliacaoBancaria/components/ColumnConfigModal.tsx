import { Columns, RotateCcw, X } from 'lucide-react'
import type { ColumnDef } from '@/features/conciliacaoBancaria/hooks/useColumnConfig'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

interface ColumnConfigModalProps {
  open: boolean
  extratoColumns: ColumnDef[]
  erpColumns: ColumnDef[]
  onToggleExtrato: (id: string) => void
  onToggleErp: (id: string) => void
  onResetExtrato: () => void
  onResetErp: () => void
  onClose: () => void
}

export function ColumnConfigModal({
  open,
  extratoColumns,
  erpColumns,
  onToggleExtrato,
  onToggleErp,
  onResetExtrato,
  onResetErp,
  onClose,
}: ColumnConfigModalProps) {
  if (!open) return null

  return (
    <div className={styles.drawerRoot} style={{ zIndex: 50 }}>
      <button type="button" className={styles.drawerOverlay} onClick={onClose} aria-label="Fechar" />

      <div
        className={styles.modalBox}
        style={{ width: 560 }}
        role="dialog"
        aria-modal
        aria-labelledby="colcfg-modal-title"
      >
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className={`${styles.kpiCardIcon} ${styles.kpiCardIconBlue}`}>
              <Columns size={16} />
            </div>
            <div>
              <h2 id="colcfg-modal-title" className={styles.modalTitle}>Configurar colunas</h2>
              <p className={styles.modalSubtitle}>Preferências salvas automaticamente no navegador</p>
            </div>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <ColumnGroup
            title="Extrato Bancário"
            columns={extratoColumns}
            onToggle={onToggleExtrato}
            onReset={onResetExtrato}
          />
          <ColumnGroup
            title="Financeiro ERP"
            columns={erpColumns}
            onToggle={onToggleErp}
            onReset={onResetErp}
          />
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnSuccess} onClick={onClose}>
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}

function ColumnGroup({
  title,
  columns,
  onToggle,
  onReset,
}: {
  title: string
  columns: ColumnDef[]
  onToggle: (id: string) => void
  onReset: () => void
}) {
  const visibleCount = columns.filter((c) => c.visible).length

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <p className={styles.filterPanelLabel} style={{ margin: 0 }}>
          {title}
          <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: 4 }}>({visibleCount} visíveis)</span>
        </p>
        <button
          type="button"
          className={styles.btnGhost}
          onClick={onReset}
          title="Restaurar padrão"
          style={{ padding: '3px 6px', fontSize: '11px' }}
        >
          <RotateCcw size={11} /> Padrão
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {columns.map((col) => (
          <label
            key={col.id}
            className={styles.colToggleRow}
            style={{ opacity: col.canHide === false ? 0.5 : 1 }}
          >
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={col.visible}
              disabled={col.canHide === false}
              onChange={() => onToggle(col.id)}
            />
            <span style={{ fontSize: '13px', color: '#374151', userSelect: 'none' }}>{col.label}</span>
            {col.canHide === false ? (
              <span style={{ fontSize: '10px', color: '#9ca3af', marginLeft: 'auto' }}>obrigatória</span>
            ) : null}
          </label>
        ))}
      </div>
    </div>
  )
}
