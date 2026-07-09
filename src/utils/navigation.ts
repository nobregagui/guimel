import { ROUTE_ACCESS_PERMISSIONS } from '@/constants/permissions'
import { APP_PATHS, type AppPath } from '@/routes/paths'
import { hasAnyPermission } from '@/utils/permissions'

/** Ordem de prioridade da rota inicial após login */
const HOME_ROUTE_ORDER: AppPath[] = [
  APP_PATHS.dashboard,
  APP_PATHS.financeiro,
  APP_PATHS.vendas,
  APP_PATHS.clientes,
  APP_PATHS.produtos,
  APP_PATHS.conciliacaoBancaria,
  APP_PATHS.notasFiscais,
  APP_PATHS.relatorios,
  APP_PATHS.configuracoes,
  APP_PATHS.cobrancas,
  APP_PATHS.integracoes,
]

export function canAccessRoute(userPermissions: string[], path: string): boolean {
  const required = ROUTE_ACCESS_PERMISSIONS[path]
  if (!required) return true
  return hasAnyPermission(userPermissions, required)
}

export function getFirstAccessibleRoute(userPermissions: string[]): string {
  for (const path of HOME_ROUTE_ORDER) {
    if (canAccessRoute(userPermissions, path)) {
      return path
    }
  }
  return APP_PATHS.forbidden
}
