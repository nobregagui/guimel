const OPEN_CNPJ_BASE_URL = import.meta.env.VITE_OPEN_CNPJ_URL ?? 'https://api.opencnpj.org'

type OpenCnpjApiResponse = {
  cnpj?: string
  razao_social?: string
  situacao_cadastral?: string
  porte_empresa?: string
  opcao_simples?: string
  data_opcao_simples?: string
  data_exclusao_simples?: string
  opcao_mei?: string
  data_opcao_mei?: string
  data_exclusao_mei?: string
}

export type CnpjSimplesNacionalStatus = {
  label: string
  isRegular: boolean
}

export type CnpjRegimeTributario = 'mei' | 'simples_nacional' | 'lucro_presumido_ou_real' | 'nao_informado'

export type CnpjRegimeTributarioInfo = {
  regime: CnpjRegimeTributario
  label: string
  detalhe: string | null
  isRegular: boolean
}

export type CnpjMeiStatus = {
  isOptante: boolean
  label: string
}

export type CnpjConsultaFound = {
  status: 'found'
  cnpj: string
  razaoSocial: string
  situacaoCadastral: string
  cadastroRegular: boolean
  porteEmpresa: string
  regimeTributario: CnpjRegimeTributarioInfo
  simplesNacional: CnpjSimplesNacionalStatus
  mei: CnpjMeiStatus
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

export function isCnpjSaveBlocked(
  documento: string,
  result: CnpjConsultaResult,
  consultEnabled: boolean,
): boolean {
  if (!consultEnabled || !isCnpjComplete(documento)) return false
  return result.status !== 'found'
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

function isOptante(opcao: string | undefined, dataExclusao: string | undefined): boolean {
  return opcao?.trim().toUpperCase() === 'S' && !dataExclusao?.trim()
}

function resolvePorteEmpresa(data: OpenCnpjApiResponse): string {
  return data.porte_empresa?.trim() || 'Não informado'
}

function resolveMei(data: OpenCnpjApiResponse): CnpjMeiStatus {
  if (isOptante(data.opcao_mei, data.data_exclusao_mei)) {
    const desde = data.data_opcao_mei?.trim()
    return {
      isOptante: true,
      label: desde ? `Optante MEI desde ${formatApiDate(desde)}` : 'Optante MEI',
    }
  }

  const exclusion = data.data_exclusao_mei?.trim()
  if (exclusion || data.opcao_mei?.trim().toUpperCase() === 'N') {
    return { isOptante: false, label: 'Não faz parte do MEI' }
  }

  return { isOptante: false, label: 'Sem informação de MEI' }
}

function resolveSimplesNacional(data: OpenCnpjApiResponse): CnpjSimplesNacionalStatus {
  if (isOptante(data.opcao_simples, data.data_exclusao_simples)) {
    const desde = data.data_opcao_simples?.trim()
    return {
      label: desde ? `Optante desde ${formatApiDate(desde)}` : 'Optante — regular',
      isRegular: true,
    }
  }

  const exclusion = data.data_exclusao_simples?.trim()
  if (exclusion || data.opcao_simples?.trim().toUpperCase() === 'N') {
    return { label: 'Não faz parte do Simples Nacional', isRegular: false }
  }

  return { label: 'Sem informação de Simples Nacional', isRegular: false }
}

function resolveRegimeTributario(data: OpenCnpjApiResponse): CnpjRegimeTributarioInfo {
  if (isOptante(data.opcao_mei, data.data_exclusao_mei)) {
    const desde = data.data_opcao_mei?.trim()
    return {
      regime: 'mei',
      label: 'MEI — Microempreendedor Individual',
      detalhe: desde ? `Enquadrado desde ${formatApiDate(desde)}` : null,
      isRegular: true,
    }
  }

  if (isOptante(data.opcao_simples, data.data_exclusao_simples)) {
    const desde = data.data_opcao_simples?.trim()
    return {
      regime: 'simples_nacional',
      label: 'Simples Nacional',
      detalhe: desde ? `Optante desde ${formatApiDate(desde)}` : null,
      isRegular: true,
    }
  }

  const simplesExcluido = data.data_exclusao_simples?.trim()
  const meiExcluido = data.data_exclusao_mei?.trim()
  const foraDoSimples =
    data.opcao_simples?.trim().toUpperCase() === 'N' ||
    data.opcao_mei?.trim().toUpperCase() === 'N' ||
    Boolean(simplesExcluido) ||
    Boolean(meiExcluido)

  if (foraDoSimples) {
    return {
      regime: 'lucro_presumido_ou_real',
      label: 'Lucro Presumido ou Lucro Real',
      detalhe: 'Não faz parte do Simples Nacional nem do MEI. A Receita não informa qual dos dois regimes se aplica.',
      isRegular: true,
    }
  }

  return {
    regime: 'nao_informado',
    label: 'Regime tributário não informado',
    detalhe: null,
    isRegular: false,
  }
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
      porteEmpresa: resolvePorteEmpresa(data),
      regimeTributario: resolveRegimeTributario(data),
      simplesNacional: resolveSimplesNacional(data),
      mei: resolveMei(data),
    }
  } catch {
    return { status: 'error', message: 'Falha na consulta. Verifique sua conexão.' }
  }
}
