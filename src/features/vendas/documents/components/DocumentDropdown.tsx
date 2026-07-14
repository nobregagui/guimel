import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, FileText } from 'lucide-react'

import type { VendaDocumentoOption, VendaDocumentoTipo } from '@/features/vendas/documents/types'
import styles from '@/features/vendas/documents/components/DocumentDropdown.module.css'

interface DocumentDropdownProps {
  options: VendaDocumentoOption[]
  onSelect: (tipo: VendaDocumentoTipo) => void
  label?: string
  variant?: 'default' | 'ghost'
  ariaLabel?: string
  align?: 'left' | 'right'
}

export function DocumentDropdown({
  options,
  onSelect,
  label = 'Documentos',
  variant = 'default',
  ariaLabel = 'Documentos da venda',
  align = 'right',
}: DocumentDropdownProps) {
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({})
  const ref = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  useLayoutEffect(() => {
    if (!open || !ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const menuWidth = 240
    const left =
      align === 'left'
        ? rect.left
        : Math.max(8, rect.right - menuWidth)

    setMenuStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left,
      right: 'auto',
      zIndex: 90,
    })
  }, [align, open])

  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (ref.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    function handleScroll() {
      setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [open])

  const handleSelect = useCallback(
    (option: VendaDocumentoOption) => {
      if (option.disabled) return
      setOpen(false)
      onSelect(option.tipo)
    },
    [onSelect],
  )

  return (
    <div
      ref={ref}
      className={styles.wrap}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className={[
          styles.trigger,
          variant === 'ghost' ? styles.triggerGhost : '',
          open ? styles.triggerOpen : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
      >
        <FileText size={14} aria-hidden />
        {label}
        <ChevronDown size={14} className={styles.chevron} aria-hidden />
      </button>

      {open
        ? createPortal(
            <ul ref={menuRef} className={styles.menu} role="menu" style={menuStyle}>
              {options.map((option) => (
                <li key={option.tipo} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    className={[styles.menuItem, option.disabled ? styles.menuItemDisabled : '']
                      .filter(Boolean)
                      .join(' ')}
                    disabled={option.disabled}
                    title={option.disabledReason}
                    aria-disabled={option.disabled || undefined}
                    onClick={() => handleSelect(option)}
                  >
                    <span className={styles.menuIcon} aria-hidden>
                      {option.icon}
                    </span>
                    <span className={styles.menuLabel}>
                      {option.label}
                      {option.disabled && option.disabledReason ? (
                        <span className={styles.menuHint}>{option.disabledReason}</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>,
            document.body,
          )
        : null}
    </div>
  )
}
