import { RouterProvider } from 'react-router-dom'

import { AuthSessionBootstrap } from '@/components/auth/AuthSessionBootstrap'
import { ToastProvider } from '@/components/ui/Toast'
import { router } from '@/routes'

function App() {
  return (
    <ToastProvider>
      <AuthSessionBootstrap />
      <RouterProvider router={router} />
    </ToastProvider>
  )
}

export default App
