import { useMemo } from 'react'

import { usePermissions } from '@/hooks/usePermissions'
import { getFirstAccessibleRoute } from '@/utils/navigation'

export function useHomeRoute(): string {
  const { userPermissions } = usePermissions()
  return useMemo(() => getFirstAccessibleRoute(userPermissions), [userPermissions])
}
