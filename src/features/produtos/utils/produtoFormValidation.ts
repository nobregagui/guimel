import type { ProdutoFieldErrors, ProdutoFormValues } from '@/features/produtos/types'

export const PRODUTO_REQUIRED_FIELDS = [
  'nome',
  'categoriaId',
  'marcaId',
  'ncm',
  'precoVenda',
] as const satisfies ReadonlyArray<keyof ProdutoFormValues>

export type ProdutoRequiredField = (typeof PRODUTO_REQUIRED_FIELDS)[number]

function isRequiredFilled(form: ProdutoFormValues, field: ProdutoRequiredField): boolean {
  switch (field) {
    case 'nome':
      return form.nome.trim().length > 0
    case 'categoriaId':
      return form.categoriaId.trim().length > 0
    case 'marcaId':
      return form.marcaId.trim().length > 0
    case 'ncm':
      return form.ncm.trim().length > 0
    case 'precoVenda':
      return form.precoVenda > 0
    default:
      return false
  }
}

export function calcProdutoProgresso(form: ProdutoFormValues): number {
  const filled = PRODUTO_REQUIRED_FIELDS.filter((field) => isRequiredFilled(form, field)).length
  return Math.round((filled / PRODUTO_REQUIRED_FIELDS.length) * 100)
}

export function validateProdutoField(
  field: keyof ProdutoFormValues,
  form: ProdutoFormValues,
): string | undefined {
  switch (field) {
    case 'nome':
      return form.nome.trim() ? undefined : 'Campo obrigatório'
    case 'categoriaId':
      return form.categoriaId ? undefined : 'Campo obrigatório'
    case 'marcaId':
      return form.marcaId ? undefined : 'Campo obrigatório'
    case 'ncm':
      return form.ncm.trim() ? undefined : 'Campo obrigatório'
    case 'precoVenda':
      if (form.precoVenda <= 0) return 'Informe um valor maior que zero'
      return undefined
    case 'precoCusto':
    case 'aliquotaIcms':
    case 'aliquotaIpi':
    case 'aliquotaPis':
    case 'aliquotaCofins':
    case 'aliquotaIss':
    case 'aliquotaFcp':
    case 'comissao': {
      const value = form[field]
      if (value == null) return undefined
      if (typeof value === 'number' && value < 0) return 'Número inválido'
      return undefined
    }
    case 'ean':
    case 'gtinTributavel':
    case 'codigoBarras': {
      const raw = String(form[field] ?? '').trim()
      if (!raw) return undefined
      if (!/^\d{8,14}$/.test(raw)) return 'Formato inválido'
      return undefined
    }
    default:
      return undefined
  }
}

export function validateProdutoForm(form: ProdutoFormValues): ProdutoFieldErrors {
  const errors: ProdutoFieldErrors = {}

  for (const field of PRODUTO_REQUIRED_FIELDS) {
    const message = validateProdutoField(field, form)
    if (message) errors[field] = message
  }

  for (const field of ['ean', 'gtinTributavel', 'codigoBarras'] as const) {
    const message = validateProdutoField(field, form)
    if (message) errors[field] = message
  }

  return errors
}

export function isProdutoFormValid(form: ProdutoFormValues): boolean {
  return Object.keys(validateProdutoForm(form)).length === 0
}

export function firstInvalidTab(errors: ProdutoFieldErrors): 'geral' | 'precos' | 'fiscal' | 'estoque' | 'complementos' {
  if (errors.nome || errors.categoriaId || errors.marcaId) return 'geral'
  if (errors.precoVenda) return 'precos'
  if (errors.ncm) return 'fiscal'
  return 'geral'
}
