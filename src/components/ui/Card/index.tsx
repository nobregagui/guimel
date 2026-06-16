import type { CSSProperties, ReactNode } from 'react'

interface CardProps {
  title?: string
  children: ReactNode
  style?: CSSProperties
}

export function Card({ title, children, style }: CardProps) {
  return (
    <section
      style={{
        backgroundColor: '#fff',
        borderRadius: 'var(--radius-md)',
        padding: '1rem',
        border: '1px solid #e4e4e7',
        ...style,
      }}
    >
      {title ? <h3 style={{ marginTop: 0 }}>{title}</h3> : null}
      {children}
    </section>
  )
}
