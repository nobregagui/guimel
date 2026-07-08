import type { ReactNode } from 'react'

import type { TableColumn } from '@/features/financeiro/types'
import styles from '@/pages/financeiro/FinanceiroPage.module.css'

interface SelectableDataTableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  getRowKey: (row: T) => string
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  emptyMessage?: string
}

export function SelectableDataTable<T>({
  columns,
  data,
  getRowKey,
  selectedIds,
  onSelectionChange,
  emptyMessage = 'Nenhum registro encontrado.',
}: SelectableDataTableProps<T>) {
  if (data.length === 0) {
    return <p className={styles.emptyState}>{emptyMessage}</p>
  }

  const allSelected = data.length > 0 && data.every((row) => selectedIds.has(getRowKey(row)))
  const someSelected = data.some((row) => selectedIds.has(getRowKey(row)))

  function toggleAll() {
    if (allSelected) {
      onSelectionChange(new Set())
      return
    }
    onSelectionChange(new Set(data.map(getRowKey)))
  }

  function toggleRow(id: string) {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.thCheckbox}>
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected && !allSelected
              }}
              onChange={toggleAll}
              aria-label="Selecionar todos"
            />
          </th>
          {columns.map((column) => (
            <th
              key={column.key}
              className={[
                column.headerClassName,
                column.align === 'right' ? styles.thRight : '',
                column.align === 'center' ? styles.thCenter : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => {
          const rowKey = getRowKey(row)
          const selected = selectedIds.has(rowKey)
          return (
            <tr key={rowKey} className={selected ? styles.rowSelected : ''}>
              <td className={styles.tdCheckbox}>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleRow(rowKey)}
                  aria-label="Selecionar linha"
                />
              </td>
              {columns.map((column) => (
                <td key={column.key} className={column.cellClassName}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

interface FinanceiroTableToolbarProps {
  title: string
  subtitle?: string
  filters?: ReactNode
  bulkBar?: ReactNode
}

export function FinanceiroTableToolbar({ title, subtitle, filters, bulkBar }: FinanceiroTableToolbarProps) {
  return (
    <div className={styles.tableToolbarStack}>
      <div className={styles.tableToolbar}>
        <div className={styles.tableToolbarLeft}>
          <p className={styles.tableToolbarTitle}>{title}</p>
          {subtitle ? <p className={styles.tableToolbarSub}>{subtitle}</p> : null}
        </div>
      </div>
      {bulkBar}
      {filters}
    </div>
  )
}
