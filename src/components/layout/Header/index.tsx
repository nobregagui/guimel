import { useNavigate } from 'react-router-dom'

import { logoutSession } from '@/services/authSession'
import { useAppStore } from '@/store'

import { Button, Logo } from '@/components/ui'

export function Header() {
  const navigate = useNavigate()
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)

  const handleLogout = async () => {
    await logoutSession()
    navigate('/auth/login')
  }

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        borderBottom: '1px solid #e4e4e7',
        backgroundColor: '#fff',
      }}
    >
      <Logo />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button variant="ghost" onClick={toggleSidebar}>
          Alternar menu
        </Button>
        <Button variant="secondary" onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </header>
  )
}
