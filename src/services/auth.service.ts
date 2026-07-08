import { api } from '@/services/api'
import type { AuthSession, LoginPayload, RegisterPayload, User } from '@/types'

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const { data } = await api.post<AuthSession>('/auth/login', payload)
    return data
  },

  async register(payload: RegisterPayload): Promise<AuthSession> {
    const { data } = await api.post<AuthSession>('/auth/register', payload)
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
