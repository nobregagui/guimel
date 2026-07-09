import { createBrowserRouter } from 'react-router-dom'

import { HomeRedirect } from '@/components/auth/HomeRedirect'
import { privateRoutes } from '@/routes/private.routes'
import { publicRoutes } from '@/routes/public.routes'

export const router = createBrowserRouter([
  ...publicRoutes,
  ...privateRoutes,
  { path: '*', element: <HomeRedirect /> },
])
