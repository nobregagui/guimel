import { SlidersHorizontal, X } from 'lucide-react'

import { FilterPills } from '@/features/clientes/components/ClientesKpiCard'
import {
  CLIENTE_SEGMENTOS,
  RECENTES_CADASTRO_FILTROS,
  RECENTES_STATUS_FILTROS,
} from '@/features/clientes/data/shared'
import type { RecentesCadastroFiltro, RecentesStatusFiltro, RecentesTableFiltros } from '@/features/clientes/types'
import styles from '@/pages/clientes/ClientesPage.module.css'

interface RecentesTableFiltersButtonProps {
  open: boolean
  activeCount: number
  onToggle: () => void
}

export function RecentesTableFiltersButton({ open, activeCount, onToggle }: RecentesTableFiltersButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.btnSecondary} ${activeCount > 0 ? styles.btnSecondaryActive : ''}`}
      onClick={onToggle}
      aria-expanded={open}
      aria-controls="recentes-table-filters"
    >
      <SlidersHorizontal size={12} />
      Filtros{activeCount > 0 ? ` (${activeCount})` : ''}
    </button>
  )
}

interface RecentesTableFiltersPanelProps {
  filtros: RecentesTableFiltros
  activeCount: number
  onChange: (filtros: RecentesTableFiltros) => void
  onClear: () => void
  onClose: () => void
}

export function RecentesTableFiltersPanel({
  filtros,
  activeCount,
  onChange,
  onClear,
  onClose,
}: RecentesTableFiltersPanelProps) {
  return (
    <div id="recentes-table-filters" className={styles.tableFiltersPanel}>
      <div className={styles.tableFiltersHeader}>
        <p className={styles.tableFiltersTitle}>Filtrar cadastros recentes</p>
        {activeCount > 0 ? (
          <button type="button" className={styles.tableFiltersClear} onClick={onClear}>
            Limpar filtros
          </button>
        ) : null}
      </div>

      <div className={styles.tableFiltersGrid}>
        <div className={styles.tableFilterGroup}>
          <label className={styles.tableFilterLabel} htmlFor="recentes-filtro-segmento">
            Segmento
          </label>
          <select
            id="recentes-filtro-segmento"
            className={styles.tableFilterSelect}
            value={filtros.segmento}
            onChange={(event) => onChange({ ...filtros, segmento: event.target.value })}
          >
            <option value="">Todos</option>
            {CLIENTE_SEGMENTOS.map((segmento) => (
              <option key={segmento} value={segmento}>
                {segmento}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.tableFilterGroup}>
          <span className={styles.tableFilterLabel}>Cadastro</span>
          <FilterPills
            options={RECENTES_CADASTRO_FILTROS}
            value={filtros.cadastro}
            onChange={(cadastro) => onChange({ ...filtros, cadastro: cadastro as RecentesCadastroFiltro })}
          />
        </div>

        <div className={styles.tableFilterGroup}>
          <span className={styles.tableFilterLabel}>Status</span>
          <FilterPills
            options={RECENTES_STATUS_FILTROS}
            value={filtros.status}
            onChange={(status) => onChange({ ...filtros, status: status as RecentesStatusFiltro })}
          />
        </div>
      </div>

      <p className={styles.tableFiltersHint}>
        A coluna Cliente usa a busca do topo da página. Os demais filtros correspondem às colunas da tabela.
      </p>

      <button type="button" className={styles.tableFiltersClose} onClick={onClose} aria-label="Fechar filtros">
        <X size={14} />
      </button>
    </div>
  )
}
