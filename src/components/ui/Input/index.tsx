import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ id, label, style, ...props }: InputProps) {
  return (
    <label htmlFor={id} style={{ display: 'grid', gap: '0.4rem' }}>
      {label ? <span style={{ fontSize: '0.9rem' }}>{label}</span> : null}
      <input
        id={id}
        {...props}
        style={{
          border: '1px solid #d4d4d8',
          borderRadius: 'var(--radius-sm)',
          padding: '0.65rem 0.75rem',
          backgroundColor: '#fff',
          ...style,
        }}
      />
    </label>
  )
}
