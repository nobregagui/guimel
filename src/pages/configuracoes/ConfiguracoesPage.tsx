import { useEffect, useState } from 'react'

import { ConfiguracoesHeader } from '@/features/configuracoes/components/ConfiguracoesHeader'
import { PerfilTab } from '@/features/configuracoes/components/tabs/PerfilTab'
import { UsuariosTab } from '@/features/configuracoes/components/tabs/UsuariosTab'
import type { ConfiguracoesAba } from '@/features/configuracoes/types'
import { useAuthStore } from '@/store'
import { isAdmin } from '@/utils/roles'

import styles from './ConfiguracoesPage.module.css'

export function ConfiguracoesPage() {
  const currentUser = useAuthStore((state) => state.user)
  const userIsAdmin = isAdmin(currentUser)
  const [abaAtiva, setAbaAtiva] = useState<ConfiguracoesAba>('perfil')
  const [usuarioDrawerOpen, setUsuarioDrawerOpen] = useState(false)

  useEffect(() => {
    if (abaAtiva === 'usuarios' && !userIsAdmin) {
      setAbaAtiva('perfil')
    }
  }, [abaAtiva, userIsAdmin])

  return (
    <div className={styles.root}>
      <ConfiguracoesHeader
        abaAtiva={abaAtiva}
        onAbaChange={setAbaAtiva}
        showNovoUsuario={abaAtiva === 'usuarios' && userIsAdmin}
        onNovoUsuario={() => setUsuarioDrawerOpen(true)}
      />

      <div className={styles.content}>
        {abaAtiva === 'perfil' ? <PerfilTab /> : null}
        {abaAtiva === 'usuarios' && userIsAdmin ? (
          <UsuariosTab
            drawerOpen={usuarioDrawerOpen}
            onCloseDrawer={() => setUsuarioDrawerOpen(false)}
          />
        ) : null}
      </div>
    </div>
  )
}
