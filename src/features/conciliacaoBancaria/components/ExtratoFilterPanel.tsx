import { X } from 'lucide-react'

import {
  EXTRATO_DATA_FILTROS,
  EXTRATO_ORIGEM_FILTROS,
  EXTRATO_STATUS_FILTROS,
  EXTRATO_TIPO_FILTROS,
} from '@/features/conciliacaoBancaria/data/shared'
import { useConciliacaoStore } from '@/features/conciliacaoBancaria/store/useConciliacaoStore'
import type { ExtratoTableFiltros } from '@/features/conciliacaoBancaria/types'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

interface ExtratoFilterPanelProps {
  filtros: ExtratoTableFiltros
  onChange: (filtros: ExtratoTableFiltros) => void
  onClose: () => void
  onClear: () => void
  activeCount: number
}

export function ExtratoFilterPanel({
  filtros,
  onChange,
  onClose,
  onClear,
  activeCount,
}: ExtratoFilterPanelProps) {
  const contas = useConciliacaoStore((s) => s.contas)

  function set<K extends keyof ExtratoTableFiltros>(key: K, value: ExtratoTableFiltros[K]) {
    onChange({ ...filtros, [key]: value })
  }

  return (
    <div className={styles.filterPanel}>
      {/* Conta */}
      <div className={styles.filterPanelField}>
        <label className={styles.filterPanelLabel}>Conta bancária</label>
        <select
          className={styles.filterSelect}
          value={filtros.contaId}
          onChange={(e) => set('contaId', e.target.value)}
        >
          <option value="todas">Todas as contas</option>
          {contas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Origem */}
      <div className={styles.filterPanelField}>
        <label className={styles.filterPanelLabel}>Origem</label>
        <select
          className={styles.filterSelect}
          value={filtros.origem}
          onChange={(e) => set('origem', e.target.value as ExtratoTableFiltros['origem'])}
        >
          {EXTRATO_ORIGEM_FILTROS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Tipo */}
      <div className={styles.filterPanelField}>
        <label className={styles.filterPanelLabel}>Tipo</label>
        <select
          className={styles.filterSelect}
          value={filtros.tipo}
          onChange={(e) => set('tipo', e.target.value as ExtratoTableFiltros['tipo'])}
        >
          {EXTRATO_TIPO_FILTROS.map((t) => (
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
          onChange={(e) => set('status', e.target.value as ExtratoTableFiltros['status'])}
        >
          {EXTRATO_STATUS_FILTROS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Data */}
      <div className={styles.filterPanelField}>
        <label className={styles.filterPanelLabel}>Período</label>
        <select
          className={styles.filterSelect}
          value={filtros.data}
          onChange={(e) => set('data', e.target.value as ExtratoTableFiltros['data'])}
        >
          {EXTRATO_DATA_FILTROS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
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
