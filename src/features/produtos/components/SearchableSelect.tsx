import { memo, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Loader2, Plus, Search, X } from 'lucide-react'

import type { ProdutoLookupOption } from '@/features/produtos/types'
import styles from '@/pages/produtos/ProdutosPage.module.css'

const DROPDOWN_MAX_HEIGHT = 240

export interface SearchableSelectProps {
  id: string
  label: string
  required?: boolean
  value: string
  options: ProdutoLookupOption[]
  placeholder?: string
  loading?: boolean
  disabled?: boolean
  error?: string
  emptyMessage?: string
  /** Força a direção do dropdown. Padrão: auto (sobe se não couber embaixo). */
  placement?: 'auto' | 'top' | 'bottom'
  onChange: (value: string) => void
  onBlur?: () => void
  onCreate?: () => void
  createLabel?: string
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function getScrollParent(element: HTMLElement | null): HTMLElement | null {
  let current = element?.parentElement ?? null
  while (current) {
    const style = window.getComputedStyle(current)
    const overflowY = style.overflowY
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
      return current
    }
    current = current.parentElement
  }
  return null
}

function SearchableSelectComponent({
  id,
  label,
  required = false,
  value,
  options,
  placeholder = 'Selecione',
  loading = false,
  disabled = false,
  error,
  emptyMessage = 'Nenhum registro encontrado',
  placement = 'auto',
  onChange,
  onBlur,
  onCreate,
  createLabel = 'Cadastrar',
}: SearchableSelectProps) {
  const listId = useId()
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const [openUpward, setOpenUpward] = useState(false)

  const selected = useMemo(
    () => options.find((option) => option.id === value) ?? null,
    [options, value],
  )

  const filtered = useMemo(() => {
    const term = normalize(query)
    if (!term) return options
    return options.filter((option) => normalize(option.nome).includes(term))
  }, [options, query])

  const updatePlacement = useCallback(() => {
    if (placement === 'top') {
      setOpenUpward(true)
      return
    }
    if (placement === 'bottom') {
      setOpenUpward(false)
      return
    }

    const wrap = wrapRef.current
    if (!wrap) return

    const rect = wrap.getBoundingClientRect()
    const scrollParent = getScrollParent(wrap)
    const viewportBottom = scrollParent
      ? scrollParent.getBoundingClientRect().bottom
      : window.innerHeight
    const viewportTop = scrollParent
      ? scrollParent.getBoundingClientRect().top
      : 0

    const spaceBelow = viewportBottom - rect.bottom
    const spaceAbove = rect.top - viewportTop

    setOpenUpward(spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow)
  }, [placement])

  const dismiss = useCallback(() => {
    setOpen(false)
    setQuery('')
    setHighlight(0)
  }, [])

  const closeWithBlur = useCallback(() => {
    dismiss()
    onBlur?.()
  }, [dismiss, onBlur])

  useLayoutEffect(() => {
    if (!open) return
    updatePlacement()
  }, [open, updatePlacement, filtered.length])

  useEffect(() => {
    if (!open) return undefined

    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) closeWithBlur()
    }

    const onReposition = () => updatePlacement()
    const scrollParent = getScrollParent(wrapRef.current)

    document.addEventListener('mousedown', onPointerDown)
    window.addEventListener('resize', onReposition)
    scrollParent?.addEventListener('scroll', onReposition, { passive: true })

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('resize', onReposition)
      scrollParent?.removeEventListener('scroll', onReposition)
    }
  }, [open, closeWithBlur, updatePlacement])

  useEffect(() => {
    setHighlight(0)
  }, [query, open])

  function selectOption(option: ProdutoLookupOption) {
    onChange(option.id)
    dismiss()
  }

  function clearValue(event: React.MouseEvent) {
    event.stopPropagation()
    onChange('')
    setQuery('')
    inputRef.current?.focus()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (disabled) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      setHighlight((current) => Math.min(current + 1, Math.max(filtered.length - 1, 0)))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlight((current) => Math.max(current - 1, 0))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      const option = filtered[highlight]
      if (open && option) selectOption(option)
      else setOpen(true)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      closeWithBlur()
    }
  }

  const displayValue = open ? query : (selected?.nome ?? '')

  return (
    <div className={`${styles.formField} ${styles.searchSelectField}`} ref={wrapRef}>
      <label htmlFor={id}>
        {label}
        {required ? ' *' : ''}
      </label>
      <div className={styles.searchSelectRow}>
        <div
          className={`${styles.searchSelectControl} ${open ? styles.searchSelectOpen : ''} ${error ? styles.searchSelectInvalid : ''} ${disabled ? styles.searchSelectDisabled : ''}`}
        >
          <Search size={14} className={styles.searchSelectIcon} aria-hidden />
          <input
            ref={inputRef}
            id={id}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-invalid={Boolean(error)}
            disabled={disabled}
            placeholder={placeholder}
            value={displayValue}
            onChange={(event) => {
              setQuery(event.target.value)
              if (!open) setOpen(true)
            }}
            onFocus={() => {
              if (!disabled) setOpen(true)
            }}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {loading ? <Loader2 size={14} className={styles.searchSelectSpinner} aria-label="Carregando" /> : null}
          {!loading && value ? (
            <button type="button" className={styles.searchSelectClear} onClick={clearValue} aria-label="Limpar seleção" disabled={disabled}>
              <X size={14} />
            </button>
          ) : null}
          <ChevronDown size={14} className={styles.searchSelectChevron} aria-hidden />
        </div>
        {!loading && options.length === 0 && onCreate ? (
          <button type="button" className={styles.searchSelectCreate} onClick={onCreate} disabled={disabled}>
            <Plus size={14} />
            {createLabel}
          </button>
        ) : null}
      </div>

      {!loading && options.length === 0 ? (
        <p className={styles.searchSelectInlineEmpty}>{emptyMessage}</p>
      ) : null}

      {open && options.length > 0 ? (
        <div
          className={`${styles.searchSelectDropdown} ${openUpward ? styles.searchSelectDropdownUp : ''}`}
          role="presentation"
        >
          {filtered.length > 0 ? (
            <ul id={listId} className={styles.searchSelectList} role="listbox">
              {filtered.map((option, index) => (
                <li key={option.id} role="option" aria-selected={option.id === value}>
                  <button
                    type="button"
                    className={`${styles.searchSelectOption} ${index === highlight ? styles.searchSelectOptionActive : ''}`}
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => selectOption(option)}
                  >
                    {option.nome}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.searchSelectEmpty}>
              <p>{emptyMessage}</p>
              {onCreate ? (
                <button type="button" className={styles.searchSelectCreate} onClick={onCreate}>
                  <Plus size={14} />
                  {createLabel}
                </button>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      {error ? <span className={styles.fieldError}>{error}</span> : null}
    </div>
  )
}

export const SearchableSelect = memo(SearchableSelectComponent)
