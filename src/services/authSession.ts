import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'

export async function logoutSession(): Promise<void> {
  const { isAuthenticated, logout } = useAuthStore.getState()

  if (isAuthenticated) {
    try {
      await authService.logout()
    } catch {
      // Limpa sessão local mesmo se a API estiver indisponível.
    }
  }

  logout()
}

export async function validateStoredSession(): Promise<void> {
  const { isAuthenticated, token, login, logout } = useAuthStore.getState()

  if (!isAuthenticated || !token) return

  try {
    const user = await authService.me()
    login({ user, token })
  } catch {
    logout()
  }
}
