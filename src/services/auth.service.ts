import { api } from '@/services/api'
import type { AuthSession, LoginPayload, RegisterPayload } from '@/types'

export const authService = {
  async login(payload: LoginPayload): Promise<AuthSession> {
    const { data } = await api.post<AuthSession>('/auth/login', payload)
    return data
  },

  async register(payload: RegisterPayload): Promise<AuthSession> {
    const { data } = await api.post<AuthSession>('/auth/register', payload)
    return data
  },
}
