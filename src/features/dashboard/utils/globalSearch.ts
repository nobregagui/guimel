import type { GlobalSearchItem } from '@/features/dashboard/types'

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

export function filterGlobalSearchItems(items: GlobalSearchItem[], query: string): GlobalSearchItem[] {
  const term = normalize(query)
  if (!term) return items.slice(0, 6)

  return items
    .filter((item) => {
      const haystack = [item.label, item.description, ...item.keywords].join(' ').toLowerCase()
      return haystack.includes(term)
    })
    .slice(0, 8)
}
