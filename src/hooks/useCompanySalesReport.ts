'use client'

import { useQuery } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { CompanySalesReport, CompanySalesQueryParams } from '@/types/api/companySales'

const fetchCompanySalesReport = async (params: CompanySalesQueryParams): Promise<CompanySalesReport[]> => {
  const queryParams = new URLSearchParams()

  if (params.startDate) queryParams.append('startDate', params.startDate)
  if (params.endDate) queryParams.append('endDate', params.endDate)

  const url = queryParams.toString()
    ? `/api/company/sales/report?${queryParams.toString()}`
    : '/api/company/sales/report'

  const response = await api.get<CompanySalesReport[]>(url)

  return response.data
}

export const useCompanySalesReport = (params: CompanySalesQueryParams = {}) => {
  const query = useQuery<CompanySalesReport[]>({
    queryKey: ['companySalesReport', params.startDate, params.endDate],
    queryFn: () => fetchCompanySalesReport(params),
    staleTime: 5 * 60 * 1000,
    retry: 2
  })

  return {
    ...query,
    salesReport: query.data || []
  }
}
