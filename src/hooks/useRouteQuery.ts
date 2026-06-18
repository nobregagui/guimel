import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useRouteQuery() {
  const [searchParams, setSearchParams] = useSearchParams()

  const getParam = useCallback((key: string) => searchParams.get(key), [searchParams])

  const removeParam = useCallback(
    (key: string) => {
      if (!searchParams.has(key)) return

      const next = new URLSearchParams(searchParams)
      next.delete(key)
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const consumeParam = useCallback(
    (key: string) => {
      const value = searchParams.get(key)
      if (value === null) return null

      removeParam(key)
      return value
    },
    [searchParams, removeParam],
  )

  return { getParam, removeParam, consumeParam, searchParams }
}
