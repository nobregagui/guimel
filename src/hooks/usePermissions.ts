import { useMemo } from 'react'

import { getRouteAccessPermissions } from '@/constants/permissions'
import { useAuthStore } from '@/store'
import {
  canWriteAny,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  isReadOnlyPermissions,
} from '@/utils/permissions'
import { isAuditor } from '@/utils/roles'

export function usePermissions() {
  const user = useAuthStore((state) => state.user)
  const userPermissions = user?.permissions ?? []

  return useMemo(
    () => ({
      user,
      userPermissions,
      can: (permission: string) => hasPermission(userPermissions, permission),
      canSome: (permissions: string[]) => hasAnyPermission(userPermissions, permissions),
      canAll: (permissions: string[]) => hasAllPermissions(userPermissions, permissions),
      canAccessRoute: (pathname: string) => {
        const required = getRouteAccessPermissions(pathname)
        if (!required) return true
        return hasAnyPermission(userPermissions, required)
      },
      canWriteModule: (writePermissions: string[]) =>
        canWriteAny(userPermissions, writePermissions),
      isReadOnly: isReadOnlyPermissions(userPermissions) || isAuditor(user),
    }),
    [user, userPermissions],
  )
}
