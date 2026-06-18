import { useEffect, useRef, useState } from 'react'

import { consultarCnpj, type CnpjConsultaResult } from '@/services/opencnpj.service'
import { useDebounce } from '@/hooks/useDebounce'

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function useCnpjConsulta(documento: string, enabled: boolean) {
  const digits = onlyDigits(documento)
  const debouncedDigits = useDebounce(digits, 600)
  const [result, setResult] = useState<CnpjConsultaResult>({ status: 'idle' })
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (!enabled || debouncedDigits.length !== 14) {
      setResult({ status: 'idle' })
      return undefined
    }

    const requestId = ++requestIdRef.current
    setResult({ status: 'loading' })

    consultarCnpj(debouncedDigits).then((response) => {
      if (requestId !== requestIdRef.current) return
      setResult(response)
    })

    return () => {
      requestIdRef.current += 1
    }
  }, [debouncedDigits, enabled])

  return result
}
