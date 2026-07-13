/** Origin of the API host without the `/api` suffix (for static `/uploads/...` assets). */
export function getApiOrigin(): string {
  const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3334/api'
  return apiBase.replace(/\/api\/?$/, '')
}

export function getApiAssetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (
    path.startsWith('http://')
    || path.startsWith('https://')
    || path.startsWith('blob:')
    || path.startsWith('data:')
  ) {
    return path
  }

  const origin = getApiOrigin()
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}
