import { api } from '@/services/api'
import type { AuthSession, LoginPayload, User } from '@/types'

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const { data } = await api.post<AuthSession>('/auth/login', payload)
    return data
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me')
    return data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },
}
