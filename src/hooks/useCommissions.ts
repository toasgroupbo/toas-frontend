import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'
import type { Commission, CommissionsFilters, CommissionsResponse, CommissionsTotals } from '@/types/api/commissions'

interface FetchCommissionsResult {
  data: Commission[]
  totals: CommissionsTotals
}

const defaultTotals: CommissionsTotals = {
  total_commission_app: '0.00',
  total_commission_company: '0.00'
}

const fetchCommissions = async (
  filters: CommissionsFilters,
  isCompanyMode: boolean,
  companyId?: number
): Promise<FetchCommissionsResult> => {
  const params: Record<string, string | number> = {}

  if (filters.startDate) {
    params.startDate = filters.startDate
  }

  if (filters.endDate) {
    params.endDate = filters.endDate
  }

  const endpoint = isCompanyMode ? '/api/commissions/company' : '/api/commissions'

  if (isCompanyMode && companyId) {
    // Company mode uses companyId
    params.companyId = companyId
  } else if (!isCompanyMode && filters.search) {
    // Admin mode uses search for company name
    params.search = filters.search
  }

  const response = await api.get<CommissionsResponse>(endpoint, { params })

  if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    return {
      data: response.data.data,
      totals: response.data.totals || defaultTotals
    }
  }

  console.error('Unexpected response format from /api/commissions:', response.data)

  return { data: [], totals: defaultTotals }
}

export const useCommissions = (filters: CommissionsFilters = {}) => {
  const { isImpersonating, actingAsCompany, isCompanyAdmin, user } = useAuth()
  const isCompanyMode = isImpersonating || isCompanyAdmin
  const companyId = actingAsCompany?.id ?? user?.company?.id ?? user?.companyId

  const query = useQuery({
    queryKey: ['commissions', isCompanyMode ? 'company' : 'admin', companyId, filters],
    queryFn: async (): Promise<FetchCommissionsResult> => {
      return fetchCommissions(filters, isCompanyMode, companyId ? Number(companyId) : undefined)
    },
    enabled: !isCompanyMode || !!companyId,
    staleTime: 30000,
    retry: 2
  })

  return {
    ...query,
    data: query.data?.data || [],
    totals: query.data?.totals || defaultTotals
  }
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
