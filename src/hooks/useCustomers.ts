'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

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

export interface VerifyPaymentResponse {
  status: string
}
export interface VerifyPaymentRequest {
  IdCorrelation: string
}

export interface RechargeRequest {
  customerIds: number[]
  amountPerCustomer: number
}

export interface RechargeResponse {
  message: string
  qrImage: string
  expiresAt: string
  totalAmount: number
  amountPerCustomer: number
  customerIds: number[]
  correlationId: string
}

const generateRechargeQR = async (data: RechargeRequest): Promise<RechargeResponse> => {
  const response = await api.post<RechargeResponse>('/api/payments/recharge/qr', data)

  return response.data
}

export const useCustomers = (params: CustomersQueryParams, enabled: boolean = true) => {
  const queryClient = useQueryClient()

  const query = useQuery<CustomersResponse>({
    queryKey: ['customers', params.page, params.limit, params.search, params.is_verified],
    queryFn: () => fetchCustomers(params),
    enabled,
    placeholderData: previousData => previousData,
    staleTime: 5 * 60 * 1000,
    retry: 2
  })

  const rechargeMutation = useMutation({
    mutationFn: generateRechargeQR,
    onSuccess: () => {}
  })

  const verifyPayment = async (correlationId: string): Promise<boolean> => {
    const payload = {
      IdCorrelation: correlationId
    }

    const response = await api.post<VerifyPaymentResponse>('/api/payments/verify-qr-recharge', payload)

    return response.data.status === 'PAID'
  }

  const verifyMutation = useMutation({
    mutationFn: verifyPayment
  })

  return {
    ...query,
    generateRechargeQR: rechargeMutation.mutateAsync,
    isGeneratingQR: rechargeMutation.isPending,
    qrData: rechargeMutation.data,
    qrError: rechargeMutation.error,
    verifyPayment: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending
  }
}
