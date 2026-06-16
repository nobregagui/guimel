export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'finance' | 'sales'
  permissions: string[]
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface AuthSession {
  user: User
  token: string
}
