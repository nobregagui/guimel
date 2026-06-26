import { useEffect } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  description: string
  handler: () => void
  disabled?: boolean
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't fire when focus is inside an input/textarea/select
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      for (const shortcut of shortcuts) {
        if (shortcut.disabled) continue

        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = (shortcut.ctrlKey ?? false) === (e.ctrlKey || e.metaKey)
        const shiftMatch = (shortcut.shiftKey ?? false) === e.shiftKey
        const altMatch = (shortcut.altKey ?? false) === e.altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault()
          shortcut.handler()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

export const CONCILIACAO_SHORTCUTS = {
  CONCILIAR: { key: 'Enter', ctrlKey: true, description: 'Conciliar selecionados (Ctrl+Enter)' },
  LIMPAR_SELECAO: { key: 'Escape', description: 'Limpar seleção (Esc)' },
  IGNORAR: { key: 'Delete', description: 'Ignorar extrato selecionado (Del)' },
  APLICAR_REGRAS: { key: 'r', ctrlKey: true, description: 'Aplicar regras (Ctrl+R)' },
  PRIMEIRA_PAGINA: { key: 'Home', ctrlKey: true, description: 'Ir para primeira página (Ctrl+Home)' },
  ULTIMA_PAGINA: { key: 'End', ctrlKey: true, description: 'Ir para última página (Ctrl+End)' },
}
