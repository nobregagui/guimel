export interface EnderecoFormValues {
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
}

export const EMPTY_ENDERECO: EnderecoFormValues = {
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: 'SP',
}

export function formatEnderecoCompleto(endereco: EnderecoFormValues): string {
  const linha = [endereco.logradouro]
  if (endereco.numero) linha[0] += `, ${endereco.numero}`
  if (endereco.complemento) linha.push(endereco.complemento)

  const partes = [linha.join(' — '), endereco.bairro, `${endereco.cidade}/${endereco.estado}`]
  if (endereco.cep) partes.push(`CEP ${endereco.cep}`)

  return partes.filter(Boolean).join(' · ')
}

export function composeLogradouroLinha(
  endereco: Pick<EnderecoFormValues, 'logradouro' | 'numero' | 'complemento' | 'bairro'>,
): string {
  const partes: string[] = []

  if (endereco.logradouro) {
    partes.push(endereco.numero ? `${endereco.logradouro}, ${endereco.numero}` : endereco.logradouro)
  }
  if (endereco.complemento) partes.push(endereco.complemento)
  if (endereco.bairro) partes.push(endereco.bairro)

  return partes.join(' — ')
}
