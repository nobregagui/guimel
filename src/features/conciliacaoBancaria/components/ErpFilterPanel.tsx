import { X } from 'lucide-react'

import {
  ERP_CATEGORIAS_PAGAR,
  ERP_CATEGORIAS_RECEBER,
  ERP_CENTROS_CUSTO,
  ERP_DATA_FILTROS,
  ERP_STATUS_FILTROS,
  ERP_TIPO_FILTROS,
} from '@/features/conciliacaoBancaria/data/shared'
import type { ErpTableFiltros } from '@/features/conciliacaoBancaria/types'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

interface ErpFilterPanelProps {
  filtros: ErpTableFiltros
  onChange: (filtros: ErpTableFiltros) => void
  onClose: () => void
  onClear: () => void
  activeCount: number
}

const ALL_CATEGORIAS = [...new Set([...ERP_CATEGORIAS_RECEBER, ...ERP_CATEGORIAS_PAGAR])].sort()

export function ErpFilterPanel({
  filtros,
  onChange,
  onClose,
  onClear,
  activeCount,
}: ErpFilterPanelProps) {
  function set<K extends keyof ErpTableFiltros>(key: K, value: ErpTableFiltros[K]) {
    onChange({ ...filtros, [key]: value })
  }

  return (
    <div className={styles.filterPanel}>
      {/* Tipo */}
      <div className={styles.filterPanelField}>
        <label className={styles.filterPanelLabel}>Tipo</label>
        <select
          className={styles.filterSelect}
          value={filtros.tipo}
          onChange={(e) => set('tipo', e.target.value as ErpTableFiltros['tipo'])}
        >
          {ERP_TIPO_FILTROS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className={styles.filterPanelField}>
        <label className={styles.filterPanelLabel}>Status</label>
        <select
          className={styles.filterSelect}
          value={filtros.status}
          onChange={(e) => set('status', e.target.value as ErpTableFiltros['status'])}
        >
          {ERP_STATUS_FILTROS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Período */}
      <div className={styles.filterPanelField}>
        <label className={styles.filterPanelLabel}>Período</label>
        <select
          className={styles.filterSelect}
          value={filtros.data}
          onChange={(e) => set('data', e.target.value as ErpTableFiltros['data'])}
        >
          {ERP_DATA_FILTROS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categoria */}
      <div className={styles.filterPanelField}>
        <label className={styles.filterPanelLabel}>Categoria</label>
        <select
          className={styles.filterSelect}
          value={filtros.categoria}
          onChange={(e) => set('categoria', e.target.value)}
        >
          <option value="">Todas as categorias</option>
          {ALL_CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Centro de custo */}
      <div className={styles.filterPanelField}>
        <label className={styles.filterPanelLabel}>Centro de custo</label>
        <select
          className={styles.filterSelect}
          value={filtros.centroCusto}
          onChange={(e) => set('centroCusto', e.target.value)}
        >
          <option value="">Todos os centros</option>
          {ERP_CENTROS_CUSTO.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Valor mínimo */}
      <div className={styles.filterPanelField}>
        <label className={styles.filterPanelLabel}>Valor mínimo (R$)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Ex: 100"
          className={styles.filterInput}
          value={filtros.valorMin}
          onChange={(e) => set('valorMin', e.target.value)}
        />
      </div>

      {/* Valor máximo */}
      <div className={styles.filterPanelField}>
        <label className={styles.filterPanelLabel}>Valor máximo (R$)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Ex: 10000"
          className={styles.filterInput}
          value={filtros.valorMax}
          onChange={(e) => set('valorMax', e.target.value)}
        />
      </div>

      {/* Ações */}
      <div className={styles.filterPanelActions}>
        {activeCount > 0 ? (
          <button type="button" className={styles.btnDanger} onClick={onClear}>
            <X size={13} /> Limpar {activeCount} filtro{activeCount !== 1 ? 's' : ''}
          </button>
        ) : null}
        <button type="button" className={styles.btnSecondary} onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  )
}
