'use client'

import { useQuery } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'

export interface ClosedByUser {
  id: number
  email: string
  fullName: string
  ci: string
  phone: string
  sessionToken: string
  createdAt: string
}

export interface ClosedTravel {
  id: number
  departure_time: string
  arrival_time: string
  price_deck_1: string
  price_deck_2: string
  travel_status: string
  type: string
  enabled: boolean
  closedAt: string
  isPaid: boolean
  paidAt: string | null
  total: string
  total_commission: string
  net_to_company: string
  cash_amount: string
  qr_amount: string
  app_amount: string
  tickets_app_count: number
  tickets_office_count: number
  tickets_count: number
  closedBy: ClosedByUser
}

export interface ClosedTravelsResponse {
  data: ClosedTravel[]
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

export interface ClosedTravelsQueryParams {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}

const fetchClosedTravels = async (
  params: ClosedTravelsQueryParams,
  companyId: number | null
): Promise<ClosedTravelsResponse> => {
  const queryParams = new URLSearchParams()

  if (params.page) queryParams.append('page', params.page.toString())
  if (params.limit) queryParams.append('limit', params.limit.toString())
  if (companyId) queryParams.append('companyId', companyId.toString())
  if (params.startDate) queryParams.append('startDate', params.startDate)
  if (params.endDate) queryParams.append('endDate', params.endDate)

  const response = await api.get<ClosedTravelsResponse>(`/api/travels/cLosed-travels/report?${queryParams.toString()}`)

  return response.data
}

export const useClosedTravels = (params: ClosedTravelsQueryParams) => {
  const { companyId, hasCompany, isImpersonating } = useAuth()

  const shouldFetch = hasCompany || isImpersonating

  return useQuery<ClosedTravelsResponse>({
    queryKey: ['closedTravels', companyId, params.page, params.limit, params.startDate, params.endDate],
    queryFn: () => fetchClosedTravels(params, companyId ? parseInt(companyId, 10) : null),
    enabled: shouldFetch,
    placeholderData: previousData => previousData,
    staleTime: 5 * 60 * 1000,
    retry: 2
  })
}
