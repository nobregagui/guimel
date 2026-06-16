import type { ReactNode } from 'react'

export interface TableColumn<TData> {
  key: keyof TData
  title: string
  render?: (row: TData) => ReactNode
}

interface TableProps<TData extends Record<string, unknown>> {
  columns: TableColumn<TData>[]
  data: TData[]
}

export function Table<TData extends Record<string, unknown>>({ columns, data }: TableProps<TData>) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                style={{
                  textAlign: 'left',
                  borderBottom: '1px solid #e4e4e7',
                  padding: '0.75rem',
                }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={String(column.key)} style={{ padding: '0.75rem', borderBottom: '1px solid #f4f4f5' }}>
                  {column.render ? column.render(row) : String(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
