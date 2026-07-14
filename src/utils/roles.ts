import { USER_ROLE_LABEL } from '@/constants/permissions'
import type { User, UserRole } from '@/types'

export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === 'admin'
}

export function isAuditor(user: User | null | undefined): boolean {
  return user?.role === 'auditor'
}

export function isAdministrative(user: User | null | undefined): boolean {
  return user?.role === 'administrative'
}

/**
 * Perfil Administrativo enxerga o Financeiro, mas não executa ações
 * (criar, editar, baixar, receber, estornar, aprovar).
 */
export function isFinanceViewOnlyRole(role: UserRole | undefined): boolean {
  return role === 'administrative'
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

/** Label amigável do perfil (ex.: administrative → Administrativo) */
export function getUserRoleLabel(role: UserRole | string | null | undefined): string {
  if (!role) return ''
  const normalized = normalizeUserRole(role as UserRole)
  return USER_ROLE_LABEL[normalized as keyof typeof USER_ROLE_LABEL] ?? String(role)
}
