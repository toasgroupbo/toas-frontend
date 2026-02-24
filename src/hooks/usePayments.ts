'use client'

import { useMutation } from '@tanstack/react-query'

import { api } from '@/libs/axios'

export interface GenerateQRResponse {
  data: {
    id: number
    qrImage: string
    expirationDate: string
  }
  state: string
  message: string
}

export interface VerifyQRResponse {
  status: 'pending' | 'paid' | 'expired' | 'cancelled'
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
  return useMutation({
    mutationFn: verifyQR
  })
}
