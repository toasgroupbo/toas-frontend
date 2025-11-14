'use client'

import { useQuery } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { CustomersResponse, CustomersQueryParams } from '@/types/api/customers'

const fetchCustomers = async (params: CustomersQueryParams): Promise<CustomersResponse> => {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (params.search) queryParams.append('search', params.search)
  if (params.is_verified !== undefined && params.is_verified !== 'all') {
    queryParams.append('is_verified', params.is_verified.toString())
  }

  const response = await api.get<CustomersResponse>(`/api/customers?${queryParams.toString()}`)

  return response.data
}

export const useCustomers = (params: CustomersQueryParams) => {
  return useQuery<CustomersResponse>({
    queryKey: ['customers', params],
    queryFn: () => fetchCustomers(params)
  })
}
