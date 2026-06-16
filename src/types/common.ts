export interface ApiResponse<TData> {
  data: TData
  message?: string
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<TData> {
  items: TData[]
  meta: PaginationMeta
}

export interface SelectOption<TValue = string> {
  label: string
  value: TValue
}
