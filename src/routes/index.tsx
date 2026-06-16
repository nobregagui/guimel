import { createBrowserRouter, Navigate } from 'react-router-dom'

import { privateRoutes } from '@/routes/private.routes'
import { publicRoutes } from '@/routes/public.routes'

export const router = createBrowserRouter([
  ...publicRoutes,
  ...privateRoutes,
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
