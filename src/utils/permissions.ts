function isReadAction(permission: string): boolean {
  return permission.split(':').includes('read')
}

/**
 * Verifica se `granted` cobre `required`.
 * Alinhado ao backend NestJS (permissions.util.ts).
 *
 * - `*` cobre tudo
 * - `*:read` cobre qualquer permissão de leitura
 * - `recurso:*` cobre qualquer ação do recurso
 * - Permissão ampla cobre escopo restrito (`vendas:read` → `vendas:read:own`)
 * - Escopo restrito NÃO cobre permissão ampla (`vendas:read:own` ↛ `vendas:read`)
 */
function permissionMatches(granted: string, required: string): boolean {
  if (granted === '*') return true
  if (granted === required) return true

  if (granted === '*:read') {
    return isReadAction(required)
  }

  if (granted.endsWith(':*')) {
    const prefix = granted.slice(0, -2)
    return required === prefix || required.startsWith(`${prefix}:`)
  }

  if (required.startsWith(`${granted}:`)) {
    return true
  }

  return false
}

export function hasPermission(userPermissions: string[], required: string): boolean {
  if (!required) return true
  if (userPermissions.length === 0) return false
  return userPermissions.some((granted) => permissionMatches(granted, required))
}

export function hasAnyPermission(userPermissions: string[], required: string[]): boolean {
  if (required.length === 0) return true
  return required.some((permission) => hasPermission(userPermissions, permission))
}

export function hasAllPermissions(userPermissions: string[], required: string[]): boolean {
  if (required.length === 0) return true
  return required.every((permission) => hasPermission(userPermissions, permission))
}

export function isReadOnlyPermissions(userPermissions: string[]): boolean {
  if (userPermissions.includes('*')) return false
  if (userPermissions.length === 0) return false
  return userPermissions.every(
    (permission) => permission === '*:read' || (isReadAction(permission) && !permission.includes('write')),
  )
}

export function canWriteAny(userPermissions: string[], writePermissions: string[]): boolean {
  if (isReadOnlyPermissions(userPermissions)) return false
  return hasAnyPermission(userPermissions, writePermissions)
}
