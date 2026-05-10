import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'
import type { Commission, CommissionsFilters, UpdateCommissionPayload } from '@/types/api/commissions'

// API Functions
const fetchCommissions = async (
  filters: CommissionsFilters,
  isCompanyMode: boolean,
  companyId?: number
): Promise<Commission[]> => {
  const params: Record<string, string> = {}

  if (filters.isPaid !== undefined) {
    params.isPaid = filters.isPaid.toString()
  }

  if (filters.startDate) {
    params.startDate = filters.startDate
  }

  if (filters.endDate) {
    params.endDate = filters.endDate
  }

  if (filters.search) {
    params.search = filters.search
  }

  // Use different endpoint for company mode and add companyId as query param
  const endpoint = isCompanyMode ? '/api/commissions/company' : '/api/commissions'

  if (isCompanyMode && companyId) {
    params.companyId = companyId.toString()
  }

  const response = await api.get<Commission[] | { data: Commission[] }>(endpoint, { params })

  // Handle both array response and object with data property
  if (Array.isArray(response.data)) {
    return response.data
  } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return (response.data as { data: Commission[] }).data
  }

  console.error('Unexpected response format from /api/commissions:', response.data)

  return []
}

const updateCommission = async (id: number, payload: UpdateCommissionPayload): Promise<Commission> => {
  const data: { paid: string; voucher?: string } = {
    paid: payload.paid
  }

  if (payload.voucherUrl) {
    data.voucher = payload.voucherUrl
  }

  const response = await api.patch<Commission>(`/api/commissions/${id}`, data)

  return response.data
}

// Hook
export const useCommissions = (filters: CommissionsFilters = {}) => {
  const { isImpersonating, actingAsCompany, isCompanyAdmin, user } = useAuth()
  const isCompanyMode = isImpersonating || isCompanyAdmin
  const companyId = actingAsCompany?.id ?? user?.company?.id ?? user?.companyId

  const query = useQuery({
    queryKey: ['commissions', isCompanyMode ? 'company' : 'admin', companyId, filters],
    queryFn: async (): Promise<Commission[]> => {
      return fetchCommissions(filters, isCompanyMode, companyId ? Number(companyId) : undefined)
    },
    enabled: !isCompanyMode || !!companyId,
    staleTime: 30000,
    retry: 2
  })

  return {
    ...query,
    data: query.data || []
  }
}

// Update Commission Hook
export const useUpdateCommission = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCommissionPayload }) =>
      updateCommission(id, payload),
    onSuccess: () => {
      // Invalidate all commission queries
      queryClient.invalidateQueries({ queryKey: ['commissions'] })
    }
  })
}
