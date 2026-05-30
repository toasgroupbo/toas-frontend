import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'
import type { CommissionsFilters, CommissionsResponse } from '@/types/api/commissions'

const fetchCommissions = async (
  filters: CommissionsFilters,
  isCompanyMode: boolean,
  companyId?: number
): Promise<CommissionsResponse> => {
  const queryParams = new URLSearchParams()

  if (filters.page) queryParams.append('page', filters.page.toString())
  if (filters.limit) queryParams.append('limit', filters.limit.toString())
  if (filters.startDate) queryParams.append('startDate', filters.startDate)
  if (filters.endDate) queryParams.append('endDate', filters.endDate)

  const endpoint = isCompanyMode ? '/api/commissions/company' : '/api/commissions'

  if (isCompanyMode && companyId) {
    queryParams.append('companyId', companyId.toString())
  } else if (!isCompanyMode && filters.search) {
    queryParams.append('search', filters.search)
  }

  const response = await api.get<CommissionsResponse>(`${endpoint}?${queryParams.toString()}`)

  return response.data
}

export const useCommissions = (filters: CommissionsFilters = {}) => {
  const { isImpersonating, actingAsCompany, isCompanyAdmin, user } = useAuth()
  const isCompanyMode = isImpersonating || isCompanyAdmin
  const companyId = actingAsCompany?.id ?? user?.company?.id ?? user?.companyId

  return useQuery<CommissionsResponse>({
    queryKey: [
      'commissions',
      isCompanyMode ? 'company' : 'admin',
      companyId,
      filters.page,
      filters.limit,
      filters.startDate,
      filters.endDate,
      filters.search
    ],
    queryFn: () => fetchCommissions(filters, isCompanyMode, companyId ? Number(companyId) : undefined),
    enabled: !isCompanyMode || !!companyId,
    placeholderData: previousData => previousData,
    staleTime: 30000,
    retry: 2
  })
}

const generateCommissions = async (): Promise<void> => {
  await api.post('/api/commissions')
}

export const useGenerateCommissions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: generateCommissions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] })
    }
  })
}
