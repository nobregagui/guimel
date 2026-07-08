import { Plus } from 'lucide-react'

import { getConfiguracoesAbas, type ConfiguracoesAba } from '@/features/configuracoes/types'
import { useAuthStore } from '@/store'
import styles from '@/pages/configuracoes/ConfiguracoesPage.module.css'

interface ConfiguracoesHeaderProps {
  abaAtiva: ConfiguracoesAba
  onAbaChange: (aba: ConfiguracoesAba) => void
  onNovoUsuario?: () => void
  showNovoUsuario?: boolean
}

export function ConfiguracoesHeader({
  abaAtiva,
  onAbaChange,
  onNovoUsuario,
  showNovoUsuario = false,
}: ConfiguracoesHeaderProps) {
  const currentUser = useAuthStore((state) => state.user)
  const abas = getConfiguracoesAbas(currentUser)

  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <div>
          <h1 className={styles.pageTitle}>Configurações</h1>
          <p className={styles.pageDescription}>
            Gerencie o perfil da empresa e os usuários do sistema.
          </p>
        </div>

        {showNovoUsuario && onNovoUsuario ? (
          <button type="button" className={styles.btnPrimary} onClick={onNovoUsuario}>
            <Plus size={14} />
            Novo usuário
          </button>
        ) : null}
      </div>

      <nav className={styles.tabs} aria-label="Seções de configurações">
        {abas.map((aba) => (
          <button
            key={aba.id}
            type="button"
            onClick={() => onAbaChange(aba.id)}
            className={`${styles.tab} ${abaAtiva === aba.id ? styles.tabActive : ''}`}
          >
            {aba.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
