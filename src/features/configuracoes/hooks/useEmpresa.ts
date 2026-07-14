import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { empresaService } from '@/services/empresa.service'
import type { EmpresaUpdatePayload } from '@/features/configuracoes/types/empresa'

export const empresaQueryKeys = {
  all: ['empresa'] as const,
  current: () => [...empresaQueryKeys.all, 'current'] as const,
}

export function useEmpresaQuery(enabled = true) {
  return useQuery({
    queryKey: empresaQueryKeys.current(),
    queryFn: () => empresaService.get(),
    enabled,
    staleTime: 60_000,
  })
}

export function useUpdateEmpresaMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: EmpresaUpdatePayload) => empresaService.update(payload),
    onSuccess: (empresa) => {
      queryClient.setQueryData(empresaQueryKeys.current(), empresa)
    },
  })
}

export function useUploadEmpresaLogoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => empresaService.uploadLogo(file),
    onSuccess: (empresa) => {
      queryClient.setQueryData(empresaQueryKeys.current(), empresa)
    },
  })
}

export function useRemoveEmpresaLogoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => empresaService.removeLogo(),
    onSuccess: (empresa) => {
      queryClient.setQueryData(empresaQueryKeys.current(), empresa)
    },
  })
}
