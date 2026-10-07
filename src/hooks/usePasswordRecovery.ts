'use client'

import { useMutation } from '@tanstack/react-query'

import { api } from '@/libs/axios'

interface ForgotPasswordRequest {
  email: string
}

interface ForgotPasswordResponse {
  message: string
}

interface ResetPasswordRequest {
  email: string
  token: string
  newPassword: string
}

interface ResetPasswordResponse {
  message: string
}

const forgotPassword = async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
  const response = await api.post<ForgotPasswordResponse>('/api/auth/forgot-password', data)

  return response.data
}

const resetPassword = async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  const response = await api.post<ResetPasswordResponse>('/api/auth/reset-password', data)

  return response.data
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPassword,
    onError: (error: any) => {
      console.error('Error en recuperación de contraseña:', error)
    }
  })
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
    onError: (error: any) => {
      console.error('Error al restablecer contraseña:', error)
    }
  })
}
