import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Travel, TravelsFilters } from '@/types/api/deposits'
import type { ProcessTransactionResponse, VerifyTransactionResponse } from '@/types/api/transactions'

// API Functions
const fetchTravelsForAdmin = async (filters: TravelsFilters): Promise<Travel[]> => {
  const params: Record<string, any> = {}

  if (filters.companyId) {
    params.companyId = filters.companyId
  }

  if (filters.status) {
    params.status = filters.status
  }

  if (filters.isPaid !== undefined) {
    params.isPaid = filters.isPaid
  }

  if (filters.startDate) {
    params.startDate = filters.startDate
  }

  if (filters.endDate) {
    params.endDate = filters.endDate
  }

  if (filters.origin_placeId) {
    params.origin_placeId = filters.origin_placeId
  }

  if (filters.destination_placeId) {
    params.destination_placeId = filters.destination_placeId
  }

  const response = await api.get<{ data: Travel[]; meta?: any }>('/api/travels/admin', { params })

  // Handle paginated response
  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return response.data.data
  }

  console.error('Unexpected response format from /api/travels/admin:', response.data)

  return []
}

const processTransaction = async (travelId: number): Promise<ProcessTransactionResponse> => {
  const response = await api.post<ProcessTransactionResponse>(`/api/transactions/process/${travelId}`)

  return response.data
}

const verifyTransaction = async (transactionId: string): Promise<VerifyTransactionResponse> => {
  const response = await api.post<VerifyTransactionResponse>(`/api/transactions/verify/${transactionId}`)

  return response.data
}

// Hooks
export const useTravelsForAdmin = (filters: TravelsFilters = {}) => {
  const query = useQuery({
    queryKey: ['travels-admin', filters],
    queryFn: async (): Promise<Travel[]> => {
      return fetchTravelsForAdmin(filters)
    },
    enabled: !!filters.companyId, // Only fetch when companyId is provided
    staleTime: 30000,
    retry: 2
  })

  return {
    ...query,
    data: query.data || []
  }
}

export const useProcessTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (travelId: number) => processTransaction(travelId),
    onSuccess: () => {
      // Invalidate travels queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['travels-admin'] })
    }
  })
}

export const useVerifyTransaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (transactionId: string) => verifyTransaction(transactionId),
    onSuccess: () => {
      // Invalidate travels queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['travels-admin'] })
    }
  })
}
