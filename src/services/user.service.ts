import { api } from '@/services/api'
import type { User, UserRole } from '@/types'
import { USER_ROLE_LABEL } from '@/constants/permissions'

export type { UserRole }

export type CreateUserPayload = {
  name: string
  email: string
  password: string
  role: UserRole
}

export type UpdateUserPayload = Partial<{
  name: string
  email: string
  role: UserRole
  password: string
}>

export { USER_ROLE_LABEL }

export const userService = {
  async list(): Promise<User[]> {
    const { data } = await api.get<User[]>('/usuarios')
    return data
  },

  async getById(id: string): Promise<User> {
    const { data } = await api.get<User>(`/usuarios/${id}`)
    return data
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await api.post<User>('/usuarios', payload)
    return data
  },

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const { data } = await api.patch<User>(`/usuarios/${id}`, payload)
    return data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/usuarios/${id}`)
  },

  async listRoles(): Promise<Array<{ value: UserRole; label: string }>> {
    const { data } = await api.get<Array<{ value: UserRole; label: string }>>('/usuarios/roles')
    return data
  },
}
