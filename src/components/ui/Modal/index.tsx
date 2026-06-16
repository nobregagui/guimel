import type { ReactNode } from 'react'

import { Button } from '@/components/ui/Button'

interface ModalProps {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
}

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <div
        style={{
          width: 'min(560px, 92vw)',
          backgroundColor: '#fff',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h3 style={{ margin: 0 }}>{title}</h3>
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </header>
        {children}
      </div>
    </div>
  )
}
