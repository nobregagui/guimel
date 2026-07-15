import axios from 'axios'

export { mapPedidoToFormValues, mapPedidoToCloneFormValues } from '@/features/vendas/utils/mapPedidoToFormValues'

export function getPedidoSaveErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback
  }

  const status = error.response?.status
  const bodyMessage = error.response?.data?.message
  const message =
    typeof bodyMessage === 'string'
      ? bodyMessage
      : Array.isArray(bodyMessage)
        ? bodyMessage.filter((item): item is string => typeof item === 'string').join(', ')
        : ''

  if (status === 409) {
    if (message && /parcela|baixad|liquid|cronograma|dataIso|data da venda|financeiro/i.test(message)) {
      return message
    }
    if (message) return message
    return 'Não é possível alterar a data da venda porque há parcela(s) já baixada(s).'
  }

  if (status === 400 && message) {
    return message
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
