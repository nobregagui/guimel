/** Perfis alinhados ao RBAC do backend NestJS */
export type UserRole =
  | 'admin'
  | 'owner'
  | 'finance_manager'
  | 'finance_analyst'
  | 'sales'
  | 'sales_supervisor'
  | 'buyer'
  | 'stockkeeper'
  | 'support'
  | 'accountant'
  | 'auditor'
  | 'cashier'
  | 'hr'
  /** @deprecated migrado para `owner` */
  | 'manager'
  /** @deprecated migrado para `finance_manager` */
  | 'finance'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  permissions: string[]
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthSession {
  user: User
  token: string
}
