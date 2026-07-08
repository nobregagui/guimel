import axios from 'axios'

import { notifyApiNetworkError } from '@/services/apiErrorNotifier'
import { useAuthStore } from '@/store/auth.store'
import { isNetworkOrTimeoutError } from '@/utils/apiErrors'

const AUTH_STORAGE_KEY = 'guime-auth'

const PUBLIC_AUTH_PATHS = ['/auth/login']

function isPublicAuthRequest(url: string | undefined): boolean {
  if (!url) return false
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path))
}

function getStoredToken(): string | null {
  const fromStore = useAuthStore.getState().token
  if (fromStore) return fromStore

  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } }
    return parsed.state?.token ?? null
  } catch {
    return null
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3334/api',
  timeout: 60_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (isPublicAuthRequest(config.url)) {
    return config
  }

  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const requestUrl = error.config?.url as string | undefined

    if (status === 401 && !isPublicAuthRequest(requestUrl)) {
      useAuthStore.getState().logout()

      const isOnAuthPage = window.location.pathname.startsWith('/auth/')
      if (!isOnAuthPage) {
        window.location.href = '/auth/login'
      }
    } else if (isNetworkOrTimeoutError(error) && !isPublicAuthRequest(requestUrl)) {
      notifyApiNetworkError()
    }

    return Promise.reject(error)
  },
)
