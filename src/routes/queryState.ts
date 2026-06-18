export const ROUTE_QUERY = {
  intent: 'acao',
  tab: 'aba',
  tipo: 'tipo',
} as const

export type RouteIntent = 'nova' | 'novo'

export function buildRoutePath(pathname: string, params?: Record<string, string>): string {
  if (!params) return pathname

  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value)
  })

  const query = search.toString()
  return query ? `${pathname}?${query}` : pathname
}

export function isRouteIntent(value: string | null): value is RouteIntent {
  return value === 'nova' || value === 'novo'
}
