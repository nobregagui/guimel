import { X } from 'lucide-react'

import { FilterPills } from '@/features/financeiro/components/FinanceiroKpiCard'
import { FinanceiroTableFiltersButton } from '@/features/financeiro/components/FinanceiroTableFiltersButton'
import {
  LANCAMENTO_CATEGORIAS,
  LANCAMENTOS_STATUS_FILTROS,
  LANCAMENTOS_TIPO_FILTROS,
  LANCAMENTOS_VENCIMENTO_FILTROS,
} from '@/features/financeiro/data/shared'
import type {
  LancamentosStatusFiltro,
  LancamentosTableFiltros,
  LancamentosTipoFiltro,
  LancamentosVencimentoFiltro,
} from '@/features/financeiro/types'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface LancamentosTableFiltersButtonProps {
  open: boolean
  activeCount: number
  onToggle: () => void
}

export function LancamentosTableFiltersButton(props: LancamentosTableFiltersButtonProps) {
  return <FinanceiroTableFiltersButton controlsId="lancamentos-table-filters" {...props} />
}

interface LancamentosTableFiltersPanelProps {
  filtros: LancamentosTableFiltros
  activeCount: number
  onChange: (filtros: LancamentosTableFiltros) => void
  onClear: () => void
  onClose: () => void
}

export function LancamentosTableFiltersPanel({
  filtros,
  activeCount,
  onChange,
  onClear,
  onClose,
}: LancamentosTableFiltersPanelProps) {
  return (
    <div id="lancamentos-table-filters" className={styles.tableFiltersPanel}>
      <div className={styles.tableFiltersHeader}>
        <p className={styles.tableFiltersTitle}>Filtrar lançamentos recentes</p>
        {activeCount > 0 ? (
          <button type="button" className={styles.tableFiltersClear} onClick={onClear}>
            Limpar filtros
          </button>
        ) : null}
      </div>

      <div className={styles.tableFiltersGrid}>
        <div className={styles.tableFilterGroup}>
          <label className={styles.tableFilterLabel} htmlFor="lancamentos-filtro-descricao">
            Descrição
          </label>
          <input
            id="lancamentos-filtro-descricao"
            className={styles.tableFilterInput}
            type="search"
            placeholder="Buscar por descrição ou documento"
            value={filtros.descricao}
            onChange={(event) => onChange({ ...filtros, descricao: event.target.value })}
          />
        </div>

        <div className={styles.tableFilterGroup}>
          <label className={styles.tableFilterLabel} htmlFor="lancamentos-filtro-categoria">
            Categoria
          </label>
          <select
            id="lancamentos-filtro-categoria"
            className={styles.tableFilterSelect}
            value={filtros.categoria}
            onChange={(event) => onChange({ ...filtros, categoria: event.target.value })}
          >
            <option value="">Todas</option>
            {LANCAMENTO_CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.tableFilterGroup}>
          <span className={styles.tableFilterLabel}>Vencimento</span>
          <FilterPills
            options={LANCAMENTOS_VENCIMENTO_FILTROS}
            value={filtros.vencimento}
            onChange={(vencimento) =>
              onChange({ ...filtros, vencimento: vencimento as LancamentosVencimentoFiltro })
            }
          />
        </div>

        <div className={styles.tableFilterGroup}>
          <span className={styles.tableFilterLabel}>Tipo</span>
          <FilterPills
            options={LANCAMENTOS_TIPO_FILTROS}
            value={filtros.tipo}
            onChange={(tipo) => onChange({ ...filtros, tipo: tipo as LancamentosTipoFiltro })}
          />
        </div>

        <div className={styles.tableFilterGroup}>
          <span className={styles.tableFilterLabel}>Status</span>
          <FilterPills
            options={LANCAMENTOS_STATUS_FILTROS}
            value={filtros.status}
            onChange={(status) => onChange({ ...filtros, status: status as LancamentosStatusFiltro })}
          />
        </div>
      </div>

      <p className={styles.tableFiltersHint}>
        Os filtros correspondem às colunas da tabela de lançamentos recentes.
      </p>

      <button type="button" className={styles.tableFiltersClose} onClick={onClose} aria-label="Fechar filtros">
        <X size={14} />
      </button>
    </div>
  )
}
