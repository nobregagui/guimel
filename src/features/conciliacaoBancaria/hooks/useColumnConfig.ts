import { useCallback, useEffect, useState } from 'react'

export interface ColumnDef {
  id: string
  label: string
  visible: boolean
  canHide?: boolean
}

const STORAGE_KEY_PREFIX = 'conciliacao_cols_'

function loadFromStorage(tableId: string, defaults: ColumnDef[]): ColumnDef[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + tableId)
    if (!raw) return defaults
    const saved: Record<string, boolean> = JSON.parse(raw)
    return defaults.map((col) => ({
      ...col,
      visible: saved[col.id] !== undefined ? saved[col.id] : col.visible,
    }))
  } catch {
    return defaults
  }
}

function saveToStorage(tableId: string, columns: ColumnDef[]) {
  const map: Record<string, boolean> = {}
  columns.forEach((c) => { map[c.id] = c.visible })
  localStorage.setItem(STORAGE_KEY_PREFIX + tableId, JSON.stringify(map))
}

export function useColumnConfig(tableId: string, defaults: ColumnDef[]) {
  const [columns, setColumns] = useState<ColumnDef[]>(() => loadFromStorage(tableId, defaults))

  useEffect(() => {
    saveToStorage(tableId, columns)
  }, [tableId, columns])

  const toggleColumn = useCallback((id: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === id && (c.canHide !== false) ? { ...c, visible: !c.visible } : c)),
    )
  }, [])

  const resetToDefaults = useCallback(() => {
    setColumns(defaults)
    localStorage.removeItem(STORAGE_KEY_PREFIX + tableId)
  }, [defaults, tableId])

  const visibleColumns = columns.filter((c) => c.visible)

  return { columns, visibleColumns, toggleColumn, resetToDefaults }
}

// ── Default column definitions ─────────────────────────────────────────────────
export const EXTRATO_COLUMNS: ColumnDef[] = [
  { id: 'sel', label: 'Sel.', visible: true, canHide: false },
  { id: 'descricao', label: 'Descrição', visible: true, canHide: false },
  { id: 'origem', label: 'Origem', visible: true },
  { id: 'data', label: 'Data', visible: true },
  { id: 'documento', label: 'Documento', visible: false },
  { id: 'valor', label: 'Valor', visible: true, canHide: false },
  { id: 'saldo', label: 'Saldo', visible: false },
  { id: 'status', label: 'Status', visible: true },
  { id: 'acoes', label: 'Ações', visible: true, canHide: false },
]

export const ERP_COLUMNS: ColumnDef[] = [
  { id: 'sel', label: 'Sel.', visible: true, canHide: false },
  { id: 'descricao', label: 'Descrição', visible: true, canHide: false },
  { id: 'tipo', label: 'Tipo', visible: true },
  { id: 'categoria', label: 'Categoria', visible: true },
  { id: 'centroCusto', label: 'Centro de custo', visible: false },
  { id: 'vencimento', label: 'Vencimento', visible: false },
  { id: 'valor', label: 'Valor', visible: true, canHide: false },
  { id: 'status', label: 'Status', visible: true },
  { id: 'acoes', label: 'Ações', visible: true, canHide: false },
]
