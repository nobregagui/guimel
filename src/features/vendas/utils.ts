import axios from 'axios'

export { mapPedidoToFormValues } from '@/features/vendas/utils/mapPedidoToFormValues'

export function getPedidoSaveErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback
  }

  const status = error.response?.status

  if (status === 409) {
    const body = error.response?.data?.message
    return typeof body === 'string' ? body : 'Pedido já registrado'
  }

  if (status === 400 && Array.isArray(error.response?.data?.message)) {
    return error.response.data.message.join(', ')
  }

  if (status === 400 && typeof error.response?.data?.message === 'string') {
    return error.response.data.message
  }

  if (status === 404) {
    return 'Pedido não encontrado'
  }

  return fallback
}

export function getPedidoActionErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback
  }

  if (typeof error.response?.data?.message === 'string') {
    return error.response.data.message
  }

  return getPedidoSaveErrorMessage(error, fallback)
}
