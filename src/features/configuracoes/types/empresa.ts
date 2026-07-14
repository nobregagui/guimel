import type { EnderecoFormValues } from '@/types/endereco'

export type RegimeTributario =
  | 'simples_nacional'
  | 'lucro_presumido'
  | 'lucro_real'
  | 'mei'

export interface Empresa {
  id: string
  nomeFantasia: string
  razaoSocial: string
  cnpj: string
  regimeTributario: RegimeTributario
  email: string
  telefone: string
  /** Path relativo ou URL absoluta do logo (ex.: /uploads/empresa/logo.png) */
  logoUrl: string | null
  endereco: EnderecoFormValues | null
  planoNome: string | null
  createdAt?: string
  updatedAt?: string
}

export interface EmpresaUpdatePayload {
  nomeFantasia?: string
  razaoSocial?: string
  cnpj?: string
  regimeTributario?: RegimeTributario
  email?: string
  telefone?: string
  endereco?: EnderecoFormValues | null
}

export interface EmpresaFormState {
  nomeFantasia: string
  razaoSocial: string
  cnpj: string
  regimeTributario: RegimeTributario
  email: string
  telefone: string
  endereco: EnderecoFormValues
}

export const REGIME_TRIBUTARIO_LABEL: Record<RegimeTributario, string> = {
  simples_nacional: 'Simples Nacional',
  lucro_presumido: 'Lucro Presumido',
  lucro_real: 'Lucro Real',
  mei: 'MEI',
}

export const REGIME_TRIBUTARIO_VALUES = Object.keys(
  REGIME_TRIBUTARIO_LABEL,
) as RegimeTributario[]
