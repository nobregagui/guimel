import { EnderecoFields } from '@/components/form/EnderecoFields'
import type { EnderecoFormValues } from '@/types/endereco'

export interface DestinatarioEnderecoValues {
  destinatarioCep: string
  destinatarioLogradouro: string
  destinatarioNumero: string
  destinatarioComplemento: string
  destinatarioBairro: string
  destinatarioCidade: string
  destinatarioEstado: string
}

const ENDERECO_TO_DESTINATARIO: Record<keyof EnderecoFormValues, keyof DestinatarioEnderecoValues> = {
  cep: 'destinatarioCep',
  logradouro: 'destinatarioLogradouro',
  numero: 'destinatarioNumero',
  complemento: 'destinatarioComplemento',
  bairro: 'destinatarioBairro',
  cidade: 'destinatarioCidade',
  estado: 'destinatarioEstado',
}

interface DestinatarioEnderecoFieldsProps {
  values: DestinatarioEnderecoValues
  onChange: (field: keyof DestinatarioEnderecoValues, value: string) => void
  idPrefix?: string
}

export function DestinatarioEnderecoFields({
  values,
  onChange,
  idPrefix = 'destinatario',
}: DestinatarioEnderecoFieldsProps) {
  return (
    <EnderecoFields
      idPrefix={idPrefix}
      values={{
        cep: values.destinatarioCep,
        logradouro: values.destinatarioLogradouro,
        numero: values.destinatarioNumero,
        complemento: values.destinatarioComplemento,
        bairro: values.destinatarioBairro,
        cidade: values.destinatarioCidade,
        estado: values.destinatarioEstado,
      }}
      onChange={(field, value) => onChange(ENDERECO_TO_DESTINATARIO[field], value)}
    />
  )
}
