import { Navigate } from 'react-router-dom'

import { usePermissions } from '@/hooks/usePermissions'
import { getFirstAccessibleRoute } from '@/utils/navigation'

export function HomeRedirect() {
  const { userPermissions } = usePermissions()
  return <Navigate to={getFirstAccessibleRoute(userPermissions)} replace />
}
