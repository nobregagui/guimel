import {
  FINANCE_APPROVAL_LIMIT,
  FINANCE_APPROVE_HIGH_VALUE_PERMISSIONS,
  FINANCE_PAY_PERMISSIONS,
  FINANCE_RECEIVE_PERMISSIONS,
  FINANCE_REVERSE_PERMISSIONS,
} from '@/constants/permissions'
import type { User, UserRole } from '@/types'
import { hasAnyPermission } from '@/utils/permissions'
import { isFinanceViewOnlyRole } from '@/utils/roles'

export type FinanceActionCheck = {
  allowed: boolean
  reason?: string
}

function formatApprovalLimit(): string {
  return FINANCE_APPROVAL_LIMIT.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function requiresHighValueApproval(role: UserRole | undefined, valor: number): boolean {
  return role === 'finance_analyst' && valor > FINANCE_APPROVAL_LIMIT
}

export function canPayTitulo(
  permissions: string[],
  role: UserRole | undefined,
  valor: number,
): FinanceActionCheck {
  if (isFinanceViewOnlyRole(role)) {
    return {
      allowed: false,
      reason: 'Perfil Administrativo possui apenas visualização no Financeiro.',
    }
  }

  if (!hasAnyPermission(permissions, [...FINANCE_PAY_PERMISSIONS])) {
    return { allowed: false }
  }

  if (
    requiresHighValueApproval(role, valor) &&
    !hasAnyPermission(permissions, [...FINANCE_APPROVE_HIGH_VALUE_PERMISSIONS])
  ) {
    return {
      allowed: false,
      reason: `Aprovação acima de R$ ${formatApprovalLimit()} requer Gerente Financeiro`,
    }
  }

  return { allowed: true }
}

export function canReceiveTitulo(
  permissions: string[],
  role?: UserRole,
): FinanceActionCheck {
  if (isFinanceViewOnlyRole(role)) {
    return {
      allowed: false,
      reason: 'Perfil Administrativo possui apenas visualização no Financeiro.',
    }
  }

  if (!hasAnyPermission(permissions, [...FINANCE_RECEIVE_PERMISSIONS])) {
    return { allowed: false }
  }
  return { allowed: true }
}

export function canReverseFinanceiro(permissions: string[], role?: UserRole): boolean {
  if (isFinanceViewOnlyRole(role)) return false
  return hasAnyPermission(permissions, [...FINANCE_REVERSE_PERMISSIONS])
}

export function canWriteContasPagar(permissions: string[], role?: UserRole): boolean {
  if (isFinanceViewOnlyRole(role)) return false
  return hasAnyPermission(permissions, [
    'contas_pagar:write',
    'contas_pagar:*',
    'financeiro:write',
    'financeiro:*',
  ])
}

export function canWriteContasReceber(permissions: string[], role?: UserRole): boolean {
  if (isFinanceViewOnlyRole(role)) return false
  return hasAnyPermission(permissions, [
    'contas_receber:write',
    'contas_receber:*',
    'financeiro:write',
    'financeiro:*',
  ])
}

export function canImportConciliacao(permissions: string[]): boolean {
  return hasAnyPermission(permissions, ['conciliacao:import', 'conciliacao:*'])
}

export function canReconcileConciliacao(permissions: string[]): boolean {
  return hasAnyPermission(permissions, [
    'conciliacao:write',
    'conciliacao:reconcile',
    'conciliacao:*',
  ])
}

export function canWriteExtrato(permissions: string[], role?: UserRole): boolean {
  if (isFinanceViewOnlyRole(role)) return false
  return hasAnyPermission(permissions, ['extrato:write', 'financeiro:write', 'financeiro:*'])
}

export function canFilterVendasByVendedor(permissions: string[], user?: User | null): boolean {
  if (user?.role === 'sales_supervisor') return true
  return hasAnyPermission(permissions, ['vendas:read:team', 'vendas:read', 'vendas:*'])
}
