import { useMemo } from 'react'

import { useAuthStore } from '@/store'

export function usePermissions() {
  const userPermissions = useAuthStore((state) => state.user?.permissions ?? [])

  return useMemo(
    () => ({
      userPermissions,
      can: (permission: string) => userPermissions.includes(permission),
      canSome: (permissions: string[]) => permissions.some((permission) => userPermissions.includes(permission)),
    }),
    [userPermissions],
  )
}
