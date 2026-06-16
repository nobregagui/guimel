import { getIniciais } from '@/features/clientes/utils'
import styles from '@/pages/clientes/ClientesPage.module.css'

interface ClienteAvatarProps {
  nome: string
  size?: 'sm' | 'md'
}

export function ClienteAvatar({ nome, size = 'md' }: ClienteAvatarProps) {
  return (
    <span className={`${styles.clienteAvatar} ${size === 'sm' ? styles.clienteAvatarSm : ''}`}>
      {getIniciais(nome)}
    </span>
  )
}
