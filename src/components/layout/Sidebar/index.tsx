import { Link } from 'react-router-dom'

import { Logo } from '@/components/ui'
import { useAppStore } from '@/store'

const menuItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/produtos', label: 'Produtos' },
  { to: '/financeiro', label: 'Financeiro' },
  { to: '/vendas', label: 'Vendas' },
  { to: '/relatorios', label: 'Relatorios' },
]

export function Sidebar() {
  const sidebarOpen = useAppStore((state) => state.sidebarOpen)

  return (
    <aside
      style={{
        width: sidebarOpen ? '220px' : '0px',
        overflow: 'hidden',
        borderRight: '1px solid #e4e4e7',
        padding: sidebarOpen ? '1rem' : '0',
        transition: 'width 0.2s ease',
        backgroundColor: '#fff',
      }}
    >
      <Link to="/dashboard" style={{ display: 'block', marginBottom: '1rem' }}>
        <Logo />
      </Link>
      <nav style={{ display: 'grid', gap: '0.5rem' }}>
        {menuItems.map((item) => (
          <Link key={item.to} to={item.to} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
