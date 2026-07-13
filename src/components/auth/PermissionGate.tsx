import type { ReactNode } from 'react'

import { usePermissions } from '@/hooks/usePermissions'
import { isFinanceViewOnlyRole } from '@/utils/roles'

interface PermissionGateProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  /** Se true, oculta quando usuário é somente leitura (auditor) */
  requireWrite?: boolean
  fallback?: ReactNode
  children: ReactNode
}

function isFinanceWritePermission(permission: string): boolean {
  const module = permission.split(':')[0]
  return (
    module === 'financeiro' ||
    module === 'contas_pagar' ||
    module === 'contas_receber' ||
    module === 'extrato'
  )
}

export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  requireWrite = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { can, canSome, canAll, isReadOnly, user } = usePermissions()

  if (requireWrite && isReadOnly) {
    return fallback
  }

  if (requireWrite && isFinanceViewOnlyRole(user?.role)) {
    const checked = permissions?.length ? permissions : permission ? [permission] : []
    if (checked.some(isFinanceWritePermission)) {
      return fallback
    }
  }

  let allowed = true

  if (permission) {
    allowed = can(permission)
  } else if (permissions && permissions.length > 0) {
    allowed = requireAll ? canAll(permissions) : canSome(permissions)
  }

  if (!allowed) return fallback

  return children
}
