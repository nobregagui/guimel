import { X } from 'lucide-react'

import { FilterPills } from '@/features/financeiro/components/FinanceiroKpiCard'
import { FinanceiroTableFiltersButton } from '@/features/financeiro/components/FinanceiroTableFiltersButton'
import {
  FORMA_PAGAMENTO_TABLE_FILTROS,
  LANCAMENTOS_STATUS_FILTROS,
  LANCAMENTOS_VENCIMENTO_FILTROS,
} from '@/features/financeiro/data/shared'
import type {
  ContasTituloTableFiltros,
  FormaPagamento,
  LancamentosStatusFiltro,
  LancamentosVencimentoFiltro,
} from '@/features/financeiro/types'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

const CONTAS_TITULO_FILTERS_ID = 'contas-titulo-table-filters'

interface ContasTituloTableFiltersButtonProps {
  open: boolean
  activeCount: number
  onToggle: () => void
}

export function ContasTituloTableFiltersButton(props: ContasTituloTableFiltersButtonProps) {
  return <FinanceiroTableFiltersButton controlsId={CONTAS_TITULO_FILTERS_ID} {...props} />
}

interface ContasTituloTableFiltersPanelProps {
  title: string
  parteLabel: string
  partePlaceholder: string
  categorias: string[]
  filtros: ContasTituloTableFiltros
  activeCount: number
  onChange: (filtros: ContasTituloTableFiltros) => void
  onClear: () => void
  onClose: () => void
}

export function ContasTituloTableFiltersPanel({
  title,
  parteLabel,
  partePlaceholder,
  categorias,
  filtros,
  activeCount,
  onChange,
  onClear,
  onClose,
}: ContasTituloTableFiltersPanelProps) {
  return (
    <div id={CONTAS_TITULO_FILTERS_ID} className={styles.tableFiltersPanel}>
      <div className={styles.tableFiltersHeader}>
        <p className={styles.tableFiltersTitle}>{title}</p>
        {activeCount > 0 ? (
          <button type="button" className={styles.tableFiltersClear} onClick={onClear}>
            Limpar filtros
          </button>
        ) : null}
      </div>

      <div className={styles.tableFiltersGrid}>
        <div className={styles.tableFilterGroup}>
          <label className={styles.tableFilterLabel} htmlFor="contas-titulo-filtro-parte">
            {parteLabel}
          </label>
          <input
            id="contas-titulo-filtro-parte"
            className={styles.tableFilterInput}
            type="search"
            placeholder={partePlaceholder}
            value={filtros.parte}
            onChange={(event) => onChange({ ...filtros, parte: event.target.value })}
          />
        </div>

        <div className={styles.tableFilterGroup}>
          <label className={styles.tableFilterLabel} htmlFor="contas-titulo-filtro-categoria">
            Categoria
          </label>
          <select
            id="contas-titulo-filtro-categoria"
            className={styles.tableFilterSelect}
            value={filtros.categoria}
            onChange={(event) => onChange({ ...filtros, categoria: event.target.value })}
          >
            <option value="">Todas</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.tableFilterGroup}>
          <label className={styles.tableFilterLabel} htmlFor="contas-titulo-filtro-forma">
            Forma
          </label>
          <select
            id="contas-titulo-filtro-forma"
            className={styles.tableFilterSelect}
            value={filtros.formaPagamento}
            onChange={(event) =>
              onChange({ ...filtros, formaPagamento: event.target.value as FormaPagamento | '' })
            }
          >
            <option value="">Todas</option>
            {FORMA_PAGAMENTO_TABLE_FILTROS.map((forma) => (
              <option key={forma.id} value={forma.id}>
                {forma.label}
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
          <span className={styles.tableFilterLabel}>Status</span>
          <FilterPills
            options={LANCAMENTOS_STATUS_FILTROS}
            value={filtros.status}
            onChange={(status) => onChange({ ...filtros, status: status as LancamentosStatusFiltro })}
          />
        </div>
      </div>

      <p className={styles.tableFiltersHint}>
        Os filtros correspondem às colunas da tabela.
      </p>

      <button type="button" className={styles.tableFiltersClose} onClick={onClose} aria-label="Fechar filtros">
        <X size={14} />
      </button>
    </div>
  )
}
