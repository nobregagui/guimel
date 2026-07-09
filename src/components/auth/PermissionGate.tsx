import type { ReactNode } from 'react'

import { usePermissions } from '@/hooks/usePermissions'

interface PermissionGateProps {
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  /** Se true, oculta quando usuário é somente leitura (auditor) */
  requireWrite?: boolean
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  requireWrite = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { can, canSome, canAll, isReadOnly } = usePermissions()

  if (requireWrite && isReadOnly) {
    return fallback
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
