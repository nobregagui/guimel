import { api } from '@/services/api'
import type { Empresa, EmpresaUpdatePayload } from '@/features/configuracoes/types/empresa'
import { getApiAssetUrl } from '@/utils/apiAssets'

function normalizeEmpresa(empresa: Empresa): Empresa {
  return {
    ...empresa,
    logoUrl: empresa.logoUrl ? getApiAssetUrl(empresa.logoUrl) ?? empresa.logoUrl : null,
  }
}

/**
 * Contratos esperados (prefixo /api):
 * - GET    /empresa
 * - PATCH  /empresa
 * - POST   /empresa/logo   (multipart: file)
 * - DELETE /empresa/logo
 */
export const empresaService = {
  async get(): Promise<Empresa> {
    const { data } = await api.get<Empresa>('/empresa')
    return normalizeEmpresa(data)
  },

  async update(payload: EmpresaUpdatePayload): Promise<Empresa> {
    const { data } = await api.patch<Empresa>('/empresa', payload)
    return normalizeEmpresa(data)
  },

  async uploadLogo(file: File): Promise<Empresa> {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.post<Empresa>('/empresa/logo', formData)
    return normalizeEmpresa(data)
  },

  async removeLogo(): Promise<Empresa> {
    const { data } = await api.delete<Empresa>('/empresa/logo')
    return normalizeEmpresa(data)
  },
}
