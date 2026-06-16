import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/store'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
