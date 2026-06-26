import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

export type ContextMenuItem =
  | {
      separator: true
      label?: never
      icon?: never
      onClick?: never
      disabled?: never
      danger?: never
    }
  | {
      separator?: false
      label: string
      icon?: React.ReactNode
      onClick: () => void
      disabled?: boolean
      danger?: boolean
    }

export interface ContextMenuState {
  x: number
  y: number
  items: ContextMenuItem[]
}

interface ContextMenuProps {
  menu: ContextMenuState | null
  onClose: () => void
}

export function ContextMenu({ menu, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menu) return undefined
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menu, onClose])

  if (!menu) return null

  // Adjust position so the menu doesn't overflow viewport
  const menuWidth = 220
  const estimatedHeight = menu.items.length * 36 + 8
  const x = Math.min(menu.x, window.innerWidth - menuWidth - 8)
  const y = Math.min(menu.y, window.innerHeight - estimatedHeight - 8)

  return createPortal(
    <div
      ref={ref}
      className={styles.contextMenu}
      style={{ top: y, left: x }}
      role="menu"
    >
      {menu.items.map((item, idx) => {
        if (item.separator) {
          return <div key={`sep-${idx}`} className={styles.contextMenuSeparator} role="separator" />
        }
        return (
          <button
            key={idx}
            type="button"
            role="menuitem"
            className={`${styles.contextMenuItem} ${item.danger ? styles.contextMenuItemDanger : ''}`}
            disabled={item.disabled}
            onClick={() => {
              if (!item.disabled) {
                item.onClick()
                onClose()
              }
            }}
          >
            {item.icon ? <span className={styles.contextMenuIcon}>{item.icon}</span> : null}
            {item.label}
          </button>
        )
      })}
    </div>,
    document.body,
  )
}

