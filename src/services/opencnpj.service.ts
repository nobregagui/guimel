const OPEN_CNPJ_BASE_URL = import.meta.env.VITE_OPEN_CNPJ_URL ?? 'https://api.opencnpj.org'

type OpenCnpjApiResponse = {
  cnpj?: string
  razao_social?: string
  situacao_cadastral?: string
  opcao_simples?: string
  data_opcao_simples?: string
  data_exclusao_simples?: string
}

export type CnpjSimplesNacionalStatus = {
  label: string
  isRegular: boolean
}

export type CnpjConsultaFound = {
  status: 'found'
  cnpj: string
  razaoSocial: string
  situacaoCadastral: string
  cadastroRegular: boolean
  simplesNacional: CnpjSimplesNacionalStatus
}

export type CnpjConsultaResult =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'not_found' }
  | { status: 'error'; message: string }
  | CnpjConsultaFound

export function onlyCnpjDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function isCnpjComplete(value: string): boolean {
  return onlyCnpjDigits(value).length === 14
}

export function isCnpjVerifiedForSave(result: CnpjConsultaResult): boolean {
  return result.status === 'found'
}

export function getCnpjSaveBlockMessage(result: CnpjConsultaResult): string {
  if (result.status === 'not_found') {
    return 'CNPJ não encontrado. Verifique o número informado.'
  }

  if (result.status === 'loading') {
    return 'Aguarde a validação do CNPJ.'
  }

  if (result.status === 'error') {
    return 'Não foi possível validar o CNPJ. Tente novamente.'
  }

  return 'Informe um CNPJ válido e aguarde a consulta.'
}

function onlyDigits(value: string): string {
  return onlyCnpjDigits(value)
}

function formatApiDate(value: string): string {
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) return value
  return `${day}/${month}/${year}`
}

function resolveSimplesNacional(data: OpenCnpjApiResponse): CnpjSimplesNacionalStatus {
  const opcao = data.opcao_simples?.trim().toUpperCase()
  const exclusion = data.data_exclusao_simples?.trim()

  if (opcao === 'S' && !exclusion) {
    return { label: 'Optante — regular', isRegular: true }
  }

  if (exclusion) {
    return {
      label: `Excluído do Simples Nacional (${formatApiDate(exclusion)})`,
      isRegular: false,
    }
  }

  if (opcao === 'N') {
    return { label: 'Não optante pelo Simples Nacional', isRegular: false }
  }

  return { label: 'Sem informação de Simples Nacional', isRegular: false }
}

export async function consultarCnpj(cnpj: string): Promise<CnpjConsultaResult> {
  const digits = onlyDigits(cnpj)

  if (digits.length !== 14) {
    return { status: 'idle' }
  }

  try {
    const response = await fetch(`${OPEN_CNPJ_BASE_URL}/${digits}`, {
      headers: { Accept: 'application/json' },
    })

    if (response.status === 404) {
      return { status: 'not_found' }
    }

    if (!response.ok) {
      return { status: 'error', message: 'Não foi possível consultar o CNPJ no momento.' }
    }

    const data = (await response.json()) as OpenCnpjApiResponse
    const situacaoCadastral = data.situacao_cadastral?.trim() || 'Não informada'

    return {
      status: 'found',
      cnpj: digits,
      razaoSocial: data.razao_social?.trim() ?? '',
      situacaoCadastral,
      cadastroRegular: situacaoCadastral.toLowerCase() === 'ativa',
      simplesNacional: resolveSimplesNacional(data),
    }
  } catch {
    return { status: 'error', message: 'Falha na consulta. Verifique sua conexão.' }
  }
}
