import { X } from 'lucide-react'

import { FilterPills } from '@/features/financeiro/components/FinanceiroKpiCard'
import { FinanceiroTableFiltersButton } from '@/features/financeiro/components/FinanceiroTableFiltersButton'
import {
  FINANCEIRO_DATA_FILTROS,
  TRANSFERENCIAS_STATUS_TABLE_FILTROS,
} from '@/features/financeiro/data/shared'
import type {
  FinanceiroDataFiltro,
  TransferenciasStatusTableFiltro,
  TransferenciasTableFiltros,
} from '@/features/financeiro/types'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

const TRANSFERENCIAS_FILTERS_ID = 'transferencias-table-filters'

interface TransferenciasTableFiltersButtonProps {
  open: boolean
  activeCount: number
  onToggle: () => void
}

export function TransferenciasTableFiltersButton(props: TransferenciasTableFiltersButtonProps) {
  return <FinanceiroTableFiltersButton controlsId={TRANSFERENCIAS_FILTERS_ID} {...props} />
}

interface TransferenciasTableFiltersPanelProps {
  filtros: TransferenciasTableFiltros
  activeCount: number
  onChange: (filtros: TransferenciasTableFiltros) => void
  onClear: () => void
  onClose: () => void
}

export function TransferenciasTableFiltersPanel({
  filtros,
  activeCount,
  onChange,
  onClear,
  onClose,
}: TransferenciasTableFiltersPanelProps) {
  return (
    <div id={TRANSFERENCIAS_FILTERS_ID} className={styles.tableFiltersPanel}>
      <div className={styles.tableFiltersHeader}>
        <p className={styles.tableFiltersTitle}>Filtrar transferências</p>
        {activeCount > 0 ? (
          <button type="button" className={styles.tableFiltersClear} onClick={onClear}>
            Limpar filtros
          </button>
        ) : null}
      </div>

      <div className={styles.tableFiltersGrid}>
        <div className={styles.tableFilterGroup}>
          <label className={styles.tableFilterLabel} htmlFor="transferencias-filtro-descricao">
            Descrição
          </label>
          <input
            id="transferencias-filtro-descricao"
            className={styles.tableFilterInput}
            type="search"
            placeholder="Buscar por descrição ou observação"
            value={filtros.descricao}
            onChange={(event) => onChange({ ...filtros, descricao: event.target.value })}
          />
        </div>

        <div className={styles.tableFilterGroup}>
          <span className={styles.tableFilterLabel}>Data</span>
          <FilterPills
            options={FINANCEIRO_DATA_FILTROS}
            value={filtros.data}
            onChange={(data) => onChange({ ...filtros, data: data as FinanceiroDataFiltro })}
          />
        </div>

        <div className={styles.tableFilterGroup}>
          <span className={styles.tableFilterLabel}>Status</span>
          <FilterPills
            options={TRANSFERENCIAS_STATUS_TABLE_FILTROS}
            value={filtros.status}
            onChange={(status) =>
              onChange({ ...filtros, status: status as TransferenciasStatusTableFiltro })
            }
          />
        </div>
      </div>

      <p className={styles.tableFiltersHint}>
        A coluna Origem → Destino usa o seletor de conta acima da tabela. Os demais filtros correspondem às colunas da tabela.
      </p>

      <button type="button" className={styles.tableFiltersClose} onClick={onClose} aria-label="Fechar filtros">
        <X size={14} />
      </button>
    </div>
  )
}
