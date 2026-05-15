import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'
import type {
  Commission,
  CommissionsFilters,
  UpdateCommissionPayload,
  CommissionsResponse,
  CommissionsTotals
} from '@/types/api/commissions'

interface FetchCommissionsResult {
  data: Commission[]
  totals: CommissionsTotals
}

const defaultTotals: CommissionsTotals = {
  total_app: '0.00',
  total_net_to_company: '0.00',
  total_balance: '0.00'
}

const fetchCommissions = async (
  filters: CommissionsFilters,
  isCompanyMode: boolean,
  companyId?: number
): Promise<FetchCommissionsResult> => {
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

  const endpoint = isCompanyMode ? '/api/commissions/company' : '/api/commissions'

  if (isCompanyMode && companyId) {
    params.companyId = companyId.toString()
  }

  const response = await api.get<Commission[] | CommissionsResponse>(endpoint, { params })

  if (Array.isArray(response.data)) {
    return { data: response.data, totals: defaultTotals }
  } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
    const res = response.data as CommissionsResponse

    return {
      data: res.data,
      totals: res.totals || defaultTotals
    }
  }

  console.error('Unexpected response format from /api/commissions:', response.data)

  return { data: [], totals: defaultTotals }
}

const updateCommission = async (id: number, payload: UpdateCommissionPayload): Promise<Commission> => {
  const data: { paid: string; voucher?: string; paidAt?: string } = {
    paid: payload.paid
  }

  if (payload.voucherUrl) {
    data.voucher = payload.voucherUrl
  }

  if (payload.paidAt) {
    data.paidAt = payload.paidAt
  }

  const response = await api.patch<Commission>(`/api/commissions/${id}`, data)

  return response.data
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

export const useUpdateCommission = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCommissionPayload }) => updateCommission(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissions'] })
    }
  })
}
