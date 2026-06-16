import { useMemo, useState } from 'react'

interface UsePaginationParams {
  initialPage?: number
  pageSize?: number
}

export function usePagination({ initialPage = 1, pageSize = 10 }: UsePaginationParams = {}) {
  const [page, setPage] = useState(initialPage)

  const pagination = useMemo(
    () => ({
      page,
      pageSize,
      nextPage: () => setPage((current) => current + 1),
      previousPage: () => setPage((current) => Math.max(current - 1, 1)),
      setPage,
      resetPagination: () => setPage(initialPage),
    }),
    [initialPage, page, pageSize],
  )

  return pagination
}
