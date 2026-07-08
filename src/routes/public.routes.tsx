import type { RouteObject } from 'react-router-dom'

import { AuthLayout } from '@/layouts'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPassword'
import { LoginPage } from '@/pages/auth/Login'

export const publicRoutes: RouteObject[] = [
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
]
