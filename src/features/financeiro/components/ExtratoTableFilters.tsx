import { X } from 'lucide-react'

import { FilterPills } from '@/features/financeiro/components/FinanceiroKpiCard'
import { FinanceiroTableFiltersButton } from '@/features/financeiro/components/FinanceiroTableFiltersButton'
import {
  EXTRATO_TIPO_TABLE_FILTROS,
  FINANCEIRO_DATA_FILTROS,
} from '@/features/financeiro/data/shared'
import type { ContaBancaria } from '@/features/financeiro/types'
import type {
  ExtratoTableFiltros,
  ExtratoTipoTableFiltro,
  FinanceiroDataFiltro,
} from '@/features/financeiro/types'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

const EXTRATO_FILTERS_ID = 'extrato-table-filters'

interface ExtratoTableFiltersButtonProps {
  open: boolean
  activeCount: number
  onToggle: () => void
}

export function ExtratoTableFiltersButton(props: ExtratoTableFiltersButtonProps) {
  return <FinanceiroTableFiltersButton controlsId={EXTRATO_FILTERS_ID} {...props} />
}

interface ExtratoTableFiltersPanelProps {
  filtros: ExtratoTableFiltros
  activeCount: number
  categorias: string[]
  contas: ContaBancaria[]
  showContaFilter: boolean
  onChange: (filtros: ExtratoTableFiltros) => void
  onClear: () => void
  onClose: () => void
}

export function ExtratoTableFiltersPanel({
  filtros,
  activeCount,
  categorias,
  contas,
  showContaFilter,
  onChange,
  onClear,
  onClose,
}: ExtratoTableFiltersPanelProps) {
  return (
    <div id={EXTRATO_FILTERS_ID} className={styles.tableFiltersPanel}>
      <div className={styles.tableFiltersHeader}>
        <p className={styles.tableFiltersTitle}>Filtrar extrato bancário</p>
        {activeCount > 0 ? (
          <button type="button" className={styles.tableFiltersClear} onClick={onClear}>
            Limpar filtros
          </button>
        ) : null}
      </div>

      <div className={styles.tableFiltersGrid}>
        <div className={styles.tableFilterGroup}>
          <label className={styles.tableFilterLabel} htmlFor="extrato-filtro-descricao">
            Descrição
          </label>
          <input
            id="extrato-filtro-descricao"
            className={styles.tableFilterInput}
            type="search"
            placeholder="Buscar por descrição ou detalhe"
            value={filtros.descricao}
            onChange={(event) => onChange({ ...filtros, descricao: event.target.value })}
          />
        </div>

        <div className={styles.tableFilterGroup}>
          <label className={styles.tableFilterLabel} htmlFor="extrato-filtro-categoria">
            Categoria
          </label>
          <select
            id="extrato-filtro-categoria"
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

        {showContaFilter ? (
          <div className={styles.tableFilterGroup}>
            <label className={styles.tableFilterLabel} htmlFor="extrato-filtro-conta">
              Conta
            </label>
            <select
              id="extrato-filtro-conta"
              className={styles.tableFilterSelect}
              value={filtros.conta}
              onChange={(event) => onChange({ ...filtros, conta: event.target.value })}
            >
              <option value="">Todas</option>
              {contas.map((conta) => (
                <option key={conta.id} value={conta.id}>
                  {conta.nome}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className={styles.tableFilterGroup}>
          <span className={styles.tableFilterLabel}>Data</span>
          <FilterPills
            options={FINANCEIRO_DATA_FILTROS}
            value={filtros.data}
            onChange={(data) => onChange({ ...filtros, data: data as FinanceiroDataFiltro })}
          />
        </div>

        <div className={styles.tableFilterGroup}>
          <span className={styles.tableFilterLabel}>Tipo</span>
          <FilterPills
            options={EXTRATO_TIPO_TABLE_FILTROS}
            value={filtros.tipo}
            onChange={(tipo) => onChange({ ...filtros, tipo: tipo as ExtratoTipoTableFiltro })}
          />
        </div>
      </div>

      <p className={styles.tableFiltersHint}>
        {showContaFilter
          ? 'Os filtros correspondem às colunas da tabela de extrato bancário.'
          : 'A coluna Conta usa o seletor acima da tabela. Os demais filtros correspondem às colunas da tabela.'}
      </p>

      <button type="button" className={styles.tableFiltersClose} onClick={onClose} aria-label="Fechar filtros">
        <X size={14} />
      </button>
    </div>
  )
}
