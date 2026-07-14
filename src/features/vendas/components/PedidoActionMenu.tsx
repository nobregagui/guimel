import { useCallback, useEffect, useRef, useState } from 'react'
import { MoreHorizontal } from 'lucide-react'

import styles from '@/pages/vendas/VendasPage.module.css'

export interface PedidoActionMenuItem {
  id: string
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
}

interface PedidoActionMenuProps {
  items: PedidoActionMenuItem[]
  ariaLabel?: string
}

export function PedidoActionMenu({ items, ariaLabel = 'Ações' }: PedidoActionMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return undefined

    function handleClickOutside(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleSelect = useCallback((item: PedidoActionMenuItem) => {
    if (item.disabled) return
    setOpen(false)
    item.onClick()
  }, [])

  if (items.length === 0) return null

  return (
    <div
      ref={ref}
      className={styles.actionMenuWrap}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className={`${styles.rowAction} ${styles.rowActionVisible}`}
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <MoreHorizontal size={16} />
      </button>

      {open ? (
        <ul className={styles.actionMenu} role="menu">
          {items.map((item) => (
            <li key={item.id} role="none">
              <button
                type="button"
                role="menuitem"
                className={`${styles.actionMenuItem} ${item.danger ? styles.actionMenuItemDanger : ''}`}
                disabled={item.disabled}
                onClick={() => handleSelect(item)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
