export interface Customer {
  id: string
  email: string
  name: string
  ci: string | null
  phone: string | null
  is_verified: boolean
  provider: 'google' | 'email' | string
  idProvider: string | null
}

export interface CustomersResponse {
  data: Customer[]
  meta: {
    total: number
    page: number
    lastPage: number
    limit: number
    offset: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface CustomersQueryParams {
  page?: number
  limit?: number
  search?: string
  is_verified?: boolean | 'all'
}
