import { Logo } from '@/components/ui'

export function Footer() {
  return (
    <footer
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '1rem',
        borderTop: '1px solid #e4e4e7',
        backgroundColor: '#fff',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
      }}
    >
      <Logo />
      <span>© {new Date().getFullYear()}</span>
    </footer>
  )
}
