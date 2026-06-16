import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'var(--primary)',
  secondary: 'var(--secondary)',
  ghost: 'transparent',
}

const variantTextStyles: Record<ButtonVariant, string> = {
  primary: '#ffffff',
  secondary: '#ffffff',
  ghost: 'var(--text-primary)',
}

export function Button({ children, variant = 'primary', style, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      style={{
        backgroundColor: variantStyles[variant],
        color: variantTextStyles[variant],
        border: variant === 'ghost' ? '1px solid #d4d4d8' : 'none',
        borderRadius: 'var(--radius-sm)',
        padding: '0.6rem 1rem',
        fontWeight: 600,
        cursor: 'pointer',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
