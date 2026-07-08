import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useToast } from '@/components/ui/Toast'
import {
  userService,
  type CreateUserPayload,
  type UpdateUserPayload,
} from '@/services/user.service'
import { getApiErrorMessage } from '@/utils/apiErrors'

export const usuariosQueryKeys = {
  all: ['usuarios'] as const,
  lists: () => [...usuariosQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...usuariosQueryKeys.all, 'detail', id] as const,
}

const FORBIDDEN_MESSAGE = 'Acesso restrito a administradores.'

function handleUsuarioMutationError(
  error: unknown,
  showToast: ReturnType<typeof useToast>['showToast'],
  fallback: string,
) {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined

  if (status === 403) {
    showToast({ message: FORBIDDEN_MESSAGE, variant: 'error' })
    return
  }

  if (status === 409) {
    showToast({
      message: getApiErrorMessage(error, 'Operação não permitida.'),
      variant: 'error',
    })
    return
  }

  showToast({ message: getApiErrorMessage(error, fallback), variant: 'error' })
}

export function getUsuariosQueryErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.status === 403) {
    return FORBIDDEN_MESSAGE
  }
  return getApiErrorMessage(error, 'Não foi possível carregar a lista de usuários.')
}

export function useUsuariosQuery(enabled = true) {
  return useQuery({
    queryKey: usuariosQueryKeys.lists(),
    queryFn: () => userService.list(),
    enabled,
  })
}

export function useCreateUsuarioMutation() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.create(payload),
    onSuccess: (user) => {
      void queryClient.invalidateQueries({ queryKey: usuariosQueryKeys.lists() })
      showToast({ message: `Usuário "${user.name}" criado com sucesso.`, variant: 'success' })
    },
    onError: (error) => {
      handleUsuarioMutationError(error, showToast, 'Não foi possível criar o usuário.')
    },
  })
}

export function useUpdateUsuarioMutation() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      userService.update(id, payload),
    onSuccess: (user) => {
      void queryClient.invalidateQueries({ queryKey: usuariosQueryKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: usuariosQueryKeys.detail(user.id) })
      showToast({ message: 'Usuário atualizado.', variant: 'success' })
    },
    onError: (error) => {
      handleUsuarioMutationError(error, showToast, 'Não foi possível atualizar o usuário.')
    },
  })
}

export function useDeleteUsuarioMutation() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: usuariosQueryKeys.lists() })
      showToast({ message: 'Usuário removido.', variant: 'success' })
    },
    onError: (error) => {
      handleUsuarioMutationError(error, showToast, 'Não foi possível remover o usuário.')
    },
  })
}
