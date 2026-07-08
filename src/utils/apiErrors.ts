import axios from 'axios'

export const NETWORK_ERROR_MESSAGE = 'Servidor indisponível, tente novamente.'

export function isNetworkOrTimeoutError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  if (!error.response) return true
  return error.code === 'ECONNABORTED'
}

export function getApiErrorMessage(error: unknown, fallback = 'Erro ao processar.'): string {
  if (isNetworkOrTimeoutError(error)) {
    return NETWORK_ERROR_MESSAGE
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    const rawMessage =
      typeof data === 'object' && data !== null && 'message' in data
        ? (data as { message: string | string[] }).message
        : undefined
    const message = Array.isArray(rawMessage) ? rawMessage.join(', ') : rawMessage
    if (message) return message
  }

  return fallback
}
