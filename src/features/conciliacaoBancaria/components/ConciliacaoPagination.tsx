import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

import type { PaginacaoResult } from '@/features/conciliacaoBancaria/hooks/usePaginacao'
import styles from '@/pages/conciliacao-bancaria/ConciliacaoBancariaPage.module.css'

interface PaginacaoProps<T> {
  paginacao: PaginacaoResult<T>
  label?: string
}

export function ConciliacaoPagination<T>({ paginacao, label = 'registro' }: PaginacaoProps<T>) {
  const { pagina, totalPaginas, inicioPagina, fimPagina, totalItens } = paginacao

  if (totalPaginas <= 1) {
    return (
      <div className={styles.tableFooter}>
        <span className={styles.tableFooterInfo}>
          {totalItens} {label}{totalItens !== 1 ? 's' : ''}
        </span>
      </div>
    )
  }

  const pages = getPaginasVisiveis(pagina, totalPaginas)

  return (
    <div className={styles.paginacao}>
      <span className={styles.paginacaoInfo}>
        {inicioPagina}–{fimPagina} de {totalItens} {label}{totalItens !== 1 ? 's' : ''}
      </span>

      <div className={styles.paginacaoBtns}>
        <button
          type="button"
          className={styles.paginacaoBtn}
          onClick={paginacao.irParaPrimeira}
          disabled={!paginacao.temAnterior}
          title="Primeira página"
          aria-label="Primeira página"
        >
          <ChevronsLeft size={14} />
        </button>
        <button
          type="button"
          className={styles.paginacaoBtn}
          onClick={paginacao.paginaAnterior}
          disabled={!paginacao.temAnterior}
          title="Página anterior"
          aria-label="Página anterior"
        >
          <ChevronLeft size={14} />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className={styles.paginacaoEllipsis}>…</span>
          ) : (
            <button
              key={p}
              type="button"
              className={`${styles.paginacaoBtn} ${p === pagina ? styles.paginacaoBtnActive : ''}`}
              onClick={() => paginacao.setPagina(p as number)}
              aria-current={p === pagina ? 'page' : undefined}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          className={styles.paginacaoBtn}
          onClick={paginacao.proximaPagina}
          disabled={!paginacao.temProxima}
          title="Próxima página"
          aria-label="Próxima página"
        >
          <ChevronRight size={14} />
        </button>
        <button
          type="button"
          className={styles.paginacaoBtn}
          onClick={paginacao.irParaUltima}
          disabled={!paginacao.temProxima}
          title="Última página"
          aria-label="Última página"
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  )
}

function getPaginasVisiveis(pagina: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = []

  if (pagina <= 4) {
    pages.push(1, 2, 3, 4, 5, '...', total)
  } else if (pagina >= total - 3) {
    pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
  } else {
    pages.push(1, '...', pagina - 1, pagina, pagina + 1, '...', total)
  }

  return pages
}
