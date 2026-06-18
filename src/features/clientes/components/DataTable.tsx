import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

import type { TableColumn } from '@/features/clientes/types'
import styles from '@/pages/clientes/ClientesPage.module.css'

interface TableToolbarProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function TableToolbar({ title, subtitle, actions }: TableToolbarProps) {
  return (
    <div className={styles.tableToolbar}>
      <div className={styles.tableToolbarLeft}>
        <p className={styles.tableToolbarTitle}>{title}</p>
        {subtitle ? <p className={styles.tableToolbarSub}>{subtitle}</p> : null}
      </div>
      {actions ? <div className={styles.tableToolbarRight}>{actions}</div> : null}
    </div>
  )
}

interface TableFooterProps {
  info: string
  actionLabel?: string
  onAction?: () => void
}

export function TableFooter({ info, actionLabel = 'Ver todos', onAction }: TableFooterProps) {
  return (
    <div className={styles.tableFooter}>
      <span className={styles.tableFooterInfo}>{info}</span>
      <button type="button" className={styles.tableFooterLink} onClick={onAction}>
        {actionLabel} <ChevronRight size={12} />
      </button>
    </div>
  )
}

interface DataTableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  getRowKey: (row: T) => string
  emptyMessage?: string
}

export function DataTable<T>({ columns, data, getRowKey, emptyMessage = 'Nenhum registro encontrado.' }: DataTableProps<T>) {
  if (data.length === 0) {
    return <p className={styles.emptyState}>{emptyMessage}</p>
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
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
        {data.map((row) => (
          <tr key={getRowKey(row)}>
            {columns.map((column) => (
              <td key={column.key} className={column.cellClassName}>
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

interface TableSectionProps {
  toolbar: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function TableSection({ toolbar, children, footer }: TableSectionProps) {
  return (
    <div className={styles.tableSection}>
      {toolbar}
      {children}
      {footer}
    </div>
  )
}
