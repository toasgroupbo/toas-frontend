'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { BillingInfo } from '@/types/api/tickets'

const searchBillingByCi = async (ci: string): Promise<BillingInfo> => {
  const response = await api.get<BillingInfo>(`/api/tickets/for-cashier/billing/${ci}`)

  return response.data
}

const createBillingForCashier = async (data: BillingInfo): Promise<BillingInfo> => {
  return data
}

export const useSearchBillingByCi = (ci: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['billing-by-ci', ci],
    queryFn: () => searchBillingByCi(ci),
    enabled: enabled && ci.length > 0,
    retry: false,
    staleTime: 1000 * 60 * 5
  })
}

export const useSearchCustomerByCi = useSearchBillingByCi

export const useCreateCustomerForCashier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBillingForCashier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-by-ci'] })
    }
  })
}
