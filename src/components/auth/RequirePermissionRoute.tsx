import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { getRouteAccessPermissions } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { APP_PATHS } from '@/routes/paths'
import { getFirstAccessibleRoute } from '@/utils/navigation'

interface RequirePermissionRouteProps {
  permissions?: string[]
  children?: React.ReactNode
}

export function RequirePermissionRoute({ permissions, children }: RequirePermissionRouteProps) {
  const location = useLocation()
  const { userPermissions, canSome } = usePermissions()

  const required =
    permissions ?? getRouteAccessPermissions(location.pathname) ?? undefined

  if (required && !canSome(required)) {
    const fallback = getFirstAccessibleRoute(userPermissions)

    if (fallback !== APP_PATHS.forbidden && fallback !== location.pathname) {
      return <Navigate to={fallback} replace />
    }

    return <Navigate to={APP_PATHS.forbidden} replace state={{ from: location.pathname }} />
  }

  return children ?? <Outlet />
}
