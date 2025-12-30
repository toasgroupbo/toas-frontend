'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Customer } from '@/types/api/customers'

const searchCustomerByCi = async (ci: string): Promise<Customer> => {
  const response = await api.get<Customer>(`/api/customers/for-cashier/${ci}`)

  return response.data
}

interface CreateCustomerForCashierDto {
  name: string
  ci: string
}

const createCustomerForCashier = async (data: CreateCustomerForCashierDto): Promise<Customer> => {
  const response = await api.post<Customer>('/api/customers/for-cashier', data)

  return response.data
}

export const useSearchCustomerByCi = (ci: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['customer-by-ci', ci],
    queryFn: () => searchCustomerByCi(ci),
    enabled: enabled && ci.length > 0, // Solo si está habilitado y hay CI
    retry: false, // No reintentar si no encuentra
    staleTime: 1000 * 60 * 5 // 5 minutos
  })
}

export const useCreateCustomerForCashier = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCustomerForCashier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-by-ci'] })
    }
  })
}
