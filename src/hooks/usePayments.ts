'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'

export interface GenerateQRResponse {
  data: {
    id: number
    qrImage: string
    expirationDate: string
  }
  state: string
  message: string
  ticketId: number
  status: string
  reserve_expiresAt: string
}

export interface VerifyQRResponse {
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED'
  paidAt?: string
}

interface GenerateQRDto {
  ticketId: number
}

interface VerifyQRDto {
  ticketId: number
}

const generateQR = async (data: GenerateQRDto): Promise<GenerateQRResponse> => {
  const response = await api.post<GenerateQRResponse>('/api/payments/generate', {
    ticketId: data.ticketId
  })

  return response.data
}

const verifyQR = async (data: VerifyQRDto): Promise<VerifyQRResponse> => {
  const response = await api.post<VerifyQRResponse>('/api/payments/verify-qr', {
    ticketId: data.ticketId
  })

  return response.data
}

export const useGenerateQR = () => {
  return useMutation({
    mutationFn: generateQR
  })
}

export const useVerifyQR = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: verifyQR,
    onSuccess: data => {
      // Invalidate queries when payment is confirmed
      if (data.status === 'PAID') {
        queryClient.invalidateQueries({ queryKey: ['tickets'] })
        queryClient.invalidateQueries({ queryKey: ['tickets-by-travel'] })
        queryClient.invalidateQueries({ queryKey: ['cashier-travels'] })
      }
    }
  })
}
