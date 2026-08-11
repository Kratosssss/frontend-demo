export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface PageParams {
  page?: number
  pageSize?: number
  keyword?: string
  [key: string]: unknown
}
