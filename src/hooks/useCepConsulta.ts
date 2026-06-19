import { useEffect, useRef, useState } from 'react'

import { useDebounce } from '@/hooks/useDebounce'
import { consultarCep, isCepComplete, type CepConsultaResult } from '@/services/viacep.service'

export function useCepConsulta(cep: string, enabled = true) {
  const debouncedCep = useDebounce(cep, 500)
  const [result, setResult] = useState<CepConsultaResult>({ status: 'idle' })
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (!enabled || !isCepComplete(debouncedCep)) {
      setResult({ status: 'idle' })
      return undefined
    }

    const requestId = ++requestIdRef.current
    setResult({ status: 'loading' })

    consultarCep(debouncedCep).then((response) => {
      if (requestId !== requestIdRef.current) return
      setResult(response)
    })

    return () => {
      requestIdRef.current += 1
    }
  }, [debouncedCep, enabled])

  return result
}
