import type { User } from '@/types'
import { canViewUsuariosModule, canManageUsuarios } from '@/utils/roles'

export type ConfiguracoesAba = 'perfil' | 'usuarios'

export const CONFIGURACOES_ABAS: Array<{ id: ConfiguracoesAba; label: string }> = [
  { id: 'perfil', label: 'Perfil da empresa' },
  { id: 'usuarios', label: 'Usuários' },
]

export function getConfiguracoesAbas(user: User | null | undefined) {
  if (!canViewUsuariosModule(user)) {
    return CONFIGURACOES_ABAS.filter((aba) => aba.id !== 'usuarios')
  }
  return CONFIGURACOES_ABAS
}

export function canEditUsuarios(user: User | null | undefined): boolean {
  return canManageUsuarios(user)
}

export type UsuarioDrawerMode = 'create' | 'edit'

export interface UsuarioFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: User['role']
}

export const EMPTY_USUARIO_FORM: UsuarioFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'sales',
}

export function usuarioToFormValues(usuario: User): UsuarioFormValues {
  return {
    name: usuario.name,
    email: usuario.email,
    password: '',
    confirmPassword: '',
    role: usuario.role,
  }
}
