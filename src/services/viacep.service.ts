import { cepMask } from '@/utils/masks'

export interface ViaCepEndereco {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
}

interface ViaCepApiResponse {
  cep?: string
  logradouro?: string
  complemento?: string
  bairro?: string
  localidade?: string
  uf?: string
  erro?: boolean
}

export type CepConsultaResult =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; endereco: ViaCepEndereco }
  | { status: 'not_found' }
  | { status: 'error'; message: string }

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function isCepComplete(cep: string): boolean {
  return onlyDigits(cep).length === 8
}

export function mapViaCepResponse(data: ViaCepApiResponse): ViaCepEndereco | null {
  if (data.erro || !data.localidade || !data.uf) return null

  return {
    cep: cepMask(data.cep ?? ''),
    logradouro: data.logradouro ?? '',
    complemento: data.complemento ?? '',
    bairro: data.bairro ?? '',
    localidade: data.localidade,
    uf: data.uf,
  }
}

export function enderecoLinhaFromViaCep(endereco: ViaCepEndereco): string {
  const partes = [endereco.logradouro]
  if (endereco.complemento) partes.push(endereco.complemento)
  if (endereco.bairro) partes.push(endereco.bairro)
  return partes.filter(Boolean).join(', ')
}

export async function consultarCep(cep: string): Promise<CepConsultaResult> {
  const digits = onlyDigits(cep)
  if (digits.length !== 8) return { status: 'idle' }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      return { status: 'error', message: 'Não foi possível consultar o CEP.' }
    }

    const data = (await response.json()) as ViaCepApiResponse
    const endereco = mapViaCepResponse(data)

    if (!endereco) {
      return { status: 'not_found' }
    }

    return { status: 'found', endereco }
  } catch {
    return { status: 'error', message: 'Erro de conexão ao consultar o CEP.' }
  }
}
