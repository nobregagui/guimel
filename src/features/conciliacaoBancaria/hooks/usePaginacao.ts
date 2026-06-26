import { useMemo, useState } from 'react'

export interface PaginacaoResult<T> {
  pagina: number
  totalPaginas: number
  itensPagina: T[]
  setPagina: (p: number) => void
  irParaPrimeira: () => void
  irParaUltima: () => void
  proximaPagina: () => void
  paginaAnterior: () => void
  temProxima: boolean
  temAnterior: boolean
  inicioPagina: number
  fimPagina: number
  totalItens: number
}

export function usePaginacao<T>(itens: T[], tamanhoPagina = 30): PaginacaoResult<T> {
  const [pagina, setPaginaRaw] = useState(1)

  const totalItens = itens.length
  const totalPaginas = Math.max(1, Math.ceil(totalItens / tamanhoPagina))

  const paginaSegura = Math.min(pagina, totalPaginas)

  const itensPagina = useMemo(() => {
    const inicio = (paginaSegura - 1) * tamanhoPagina
    return itens.slice(inicio, inicio + tamanhoPagina)
  }, [itens, paginaSegura, tamanhoPagina])

  const inicioPagina = totalItens === 0 ? 0 : (paginaSegura - 1) * tamanhoPagina + 1
  const fimPagina = Math.min(paginaSegura * tamanhoPagina, totalItens)

  function setPagina(p: number) {
    setPaginaRaw(Math.max(1, Math.min(p, totalPaginas)))
  }

  return {
    pagina: paginaSegura,
    totalPaginas,
    itensPagina,
    setPagina,
    irParaPrimeira: () => setPagina(1),
    irParaUltima: () => setPagina(totalPaginas),
    proximaPagina: () => setPagina(paginaSegura + 1),
    paginaAnterior: () => setPagina(paginaSegura - 1),
    temProxima: paginaSegura < totalPaginas,
    temAnterior: paginaSegura > 1,
    inicioPagina,
    fimPagina,
    totalItens,
  }
}
