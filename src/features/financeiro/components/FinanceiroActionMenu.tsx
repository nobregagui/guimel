import { useCallback, useEffect, useRef, useState } from 'react'

import styles from '@/pages/financeiro/FinanceiroPage.module.css'

export interface ActionMenuItem {
  id: string
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  future?: boolean
}

interface FinanceiroActionMenuProps {
  items: ActionMenuItem[]
  ariaLabel?: string
}

export function FinanceiroActionMenu({ items, ariaLabel = 'Ações' }: FinanceiroActionMenuProps) {
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

  const handleSelect = useCallback((item: ActionMenuItem) => {
    if (item.disabled || item.future) return
    setOpen(false)
    item.onClick()
  }, [])

  return (
    <div ref={ref} className={styles.actionMenuWrap}>
      <button
        type="button"
        className={styles.rowAction}
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="5" r="1" fill="currentColor" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <circle cx="12" cy="19" r="1" fill="currentColor" />
        </svg>
      </button>

      {open ? (
        <ul className={styles.actionMenu} role="menu">
          {items.map((item) => (
            <li key={item.id} role="none">
              <button
                type="button"
                role="menuitem"
                className={`${styles.actionMenuItem} ${item.danger ? styles.actionMenuItemDanger : ''}`}
                disabled={item.disabled || item.future}
                onClick={() => handleSelect(item)}
              >
                {item.label}
                {item.future ? <span className={styles.actionMenuFuture}>Em breve</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
