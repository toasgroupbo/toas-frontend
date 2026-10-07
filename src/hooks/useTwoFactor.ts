'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'

interface GenerateTwoFactorRequest {
  password: string
}

interface GenerateTwoFactorResponse {
  qrCode: string
  secret: string
  otpauthUrl: string
}

interface TwoFactorCodeRequest {
  code: string
}

interface TwoFactorResponse {
  message: string
}

const generate2FA = async (data: GenerateTwoFactorRequest): Promise<GenerateTwoFactorResponse> => {
  const response = await api.post<GenerateTwoFactorResponse>('/api/auth/2fa/generate', data)

  return response.data
}

const enable2FA = async (data: TwoFactorCodeRequest): Promise<TwoFactorResponse> => {
  const response = await api.post<TwoFactorResponse>('/api/auth/2fa/enable', data)

  return response.data
}

const disable2FA = async (data: TwoFactorCodeRequest): Promise<TwoFactorResponse> => {
  const response = await api.post<TwoFactorResponse>('/api/auth/2fa/disable', data)

  return response.data
}

const reset2FA = async (userId: string): Promise<TwoFactorResponse> => {
  const response = await api.patch<TwoFactorResponse>(`/api/users/${userId}/2fa/reset`)

  return response.data
}

export const useGenerate2FA = () => {
  return useMutation({
    mutationFn: generate2FA,
    onError: (error: any) => {
      console.error('Error generando 2FA:', error)
    }
  })
}

export const useEnable2FA = () => {
  return useMutation({
    mutationFn: enable2FA,
    onError: (error: any) => {
      console.error('Error activando 2FA:', error)
    }
  })
}

export const useDisable2FA = () => {
  return useMutation({
    mutationFn: disable2FA,
    onError: (error: any) => {
      console.error('Error desactivando 2FA:', error)
    }
  })
}

export const useReset2FA = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: reset2FA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashiers'] })
      queryClient.invalidateQueries({ queryKey: ['owners'] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error: any) => {
      console.error('Error restableciendo 2FA:', error)
    }
  })
}
