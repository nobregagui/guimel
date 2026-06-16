import type { ReactNode } from 'react'

type BadgeVariant = 'success' | 'warning' | 'neutral'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
}

const backgroundByVariant: Record<BadgeVariant, string> = {
  success: '#dcfce7',
  warning: '#ffedd5',
  neutral: '#e4e4e7',
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '999px',
        padding: '0.2rem 0.6rem',
        backgroundColor: backgroundByVariant[variant],
        color: 'var(--text-primary)',
        fontSize: '0.8rem',
      }}
    >
      {children}
    </span>
  )
}
