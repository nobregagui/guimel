import { useEffect, useRef } from 'react'

import { CepConsultaStatus } from '@/components/form/CepConsultaStatus'
import styles from '@/components/form/EnderecoFields.module.css'
import { ESTADOS_BR } from '@/features/clientes/data/shared'
import { useCepConsulta } from '@/hooks/useCepConsulta'
import type { EnderecoFormValues } from '@/types/endereco'
import { cepMask } from '@/utils/masks'

export type { EnderecoFormValues }

export interface EnderecoFieldsProps {
  values: EnderecoFormValues
  onChange: (field: keyof EnderecoFormValues, value: string) => void
  errors?: Partial<Record<keyof EnderecoFormValues, string>>
  idPrefix?: string
  required?: boolean
}

export function EnderecoFields({
  values,
  onChange,
  errors = {},
  idPrefix = 'endereco',
  required = true,
}: EnderecoFieldsProps) {
  const cepConsulta = useCepConsulta(values.cep)
  const lastAppliedCepRef = useRef('')
  const requiredMark = required ? ' *' : ''

  useEffect(() => {
    if (cepConsulta.status !== 'found') return

    const digits = values.cep.replace(/\D/g, '')
    if (lastAppliedCepRef.current === digits) return

    const { endereco } = cepConsulta
    lastAppliedCepRef.current = digits

    onChange('cep', endereco.cep)
    onChange('logradouro', endereco.logradouro)
    onChange('bairro', endereco.bairro)
    onChange('cidade', endereco.localidade)
    onChange('estado', endereco.uf)
    if (endereco.complemento) {
      onChange('complemento', endereco.complemento)
    }
  }, [cepConsulta, onChange, values.cep])

  function handleCepChange(raw: string) {
    const masked = cepMask(raw)
    if (masked.replace(/\D/g, '') !== values.cep.replace(/\D/g, '')) {
      lastAppliedCepRef.current = ''
    }
    onChange('cep', masked)
  }

  return (
    <div className={styles.grid}>
      <div className={styles.field}>
        <label htmlFor={`${idPrefix}-cep`}>CEP{requiredMark}</label>
        <input
          id={`${idPrefix}-cep`}
          type="text"
          inputMode="numeric"
          placeholder="00000-000"
          value={values.cep}
          onChange={(event) => handleCepChange(event.target.value)}
          autoComplete="postal-code"
        />
        <CepConsultaStatus result={cepConsulta} />
        {errors.cep ? <span className={styles.fieldError}>{errors.cep}</span> : null}
      </div>

      <div className={`${styles.field} ${styles.fieldFull}`}>
        <label htmlFor={`${idPrefix}-logradouro`}>Logradouro{requiredMark}</label>
        <input
          id={`${idPrefix}-logradouro`}
          type="text"
          placeholder="Rua, avenida..."
          value={values.logradouro}
          onChange={(event) => onChange('logradouro', event.target.value)}
          autoComplete="address-line1"
        />
        {errors.logradouro ? <span className={styles.fieldError}>{errors.logradouro}</span> : null}
      </div>

      <div className={styles.field}>
        <label htmlFor={`${idPrefix}-numero`}>Número{requiredMark}</label>
        <input
          id={`${idPrefix}-numero`}
          type="text"
          placeholder="123"
          value={values.numero}
          onChange={(event) => onChange('numero', event.target.value)}
        />
        {errors.numero ? <span className={styles.fieldError}>{errors.numero}</span> : null}
      </div>

      <div className={styles.field}>
        <label htmlFor={`${idPrefix}-complemento`}>Complemento</label>
        <input
          id={`${idPrefix}-complemento`}
          type="text"
          placeholder="Sala, bloco, apto..."
          value={values.complemento}
          onChange={(event) => onChange('complemento', event.target.value)}
          autoComplete="address-line2"
        />
        {errors.complemento ? <span className={styles.fieldError}>{errors.complemento}</span> : null}
      </div>

      <div className={styles.field}>
        <label htmlFor={`${idPrefix}-bairro`}>Bairro{requiredMark}</label>
        <input
          id={`${idPrefix}-bairro`}
          type="text"
          placeholder="Centro"
          value={values.bairro}
          onChange={(event) => onChange('bairro', event.target.value)}
        />
        {errors.bairro ? <span className={styles.fieldError}>{errors.bairro}</span> : null}
      </div>

      <div className={styles.field}>
        <label htmlFor={`${idPrefix}-cidade`}>Cidade{requiredMark}</label>
        <input
          id={`${idPrefix}-cidade`}
          type="text"
          placeholder="São Paulo"
          value={values.cidade}
          onChange={(event) => onChange('cidade', event.target.value)}
          autoComplete="address-level2"
        />
        {errors.cidade ? <span className={styles.fieldError}>{errors.cidade}</span> : null}
      </div>

      <div className={styles.field}>
        <label htmlFor={`${idPrefix}-estado`}>Estado{requiredMark}</label>
        <select
          id={`${idPrefix}-estado`}
          value={values.estado}
          onChange={(event) => onChange('estado', event.target.value)}
          autoComplete="address-level1"
        >
          {ESTADOS_BR.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </select>
        {errors.estado ? <span className={styles.fieldError}>{errors.estado}</span> : null}
      </div>
    </div>
  )
}
