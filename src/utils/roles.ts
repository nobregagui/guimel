import type { User, UserRole } from '@/types'

export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === 'admin'
}

export function isAuditor(user: User | null | undefined): boolean {
  return user?.role === 'auditor'
}

/** CRUD /usuarios → somente administradores (backend bloqueia demais perfis) */
export function canManageUsuarios(user: User | null | undefined): boolean {
  return isAdmin(user)
}

/** Aba Usuários visível apenas para admin (GET /usuarios é admin-only no backend) */
export function canViewUsuariosModule(user: User | null | undefined): boolean {
  return isAdmin(user)
}

export function normalizeUserRole(role: UserRole): UserRole {
  if (role === 'manager') return 'owner'
  if (role === 'finance') return 'finance_manager'
  return role
}
