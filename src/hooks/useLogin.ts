'use client'

import { useMutation } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'
import type {
  LoginRequest,
  LoginResponse,
  LoginSuccessResponse,
  TwoFactorLoginRequest,
  User
} from '@/types/api/auth'

const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/api/auth/login', credentials)

  return response.data
}

const login2FA = async (data: TwoFactorLoginRequest): Promise<LoginSuccessResponse> => {
  const response = await api.post<LoginSuccessResponse>('/api/auth/login/2fa', data)

  return response.data
}

const mapUserResponse = (userData: LoginSuccessResponse['user']): User => ({
  id: userData.id,
  email: userData.email,
  fullName: userData.fullName,
  ci: userData.ci,
  phone: userData.phone,
  rol: {
    id: userData.rol.id,
    name: userData.rol.name,
    isStatic: userData.rol.isStatic,
    permissions: userData.rol.permissions || []
  },
  company: userData.company,
  companyId: userData.company?.id || null,
  office: userData.office || null,
  isTwoFactorEnabled: userData.isTwoFactorEnabled
})

export const useLogin = () => {
  const { login } = useAuth()

  return useMutation({
    mutationFn: loginUser,
    onSuccess: data => {
      if ('twoFactorRequired' in data) {
        return
      }

      const user = mapUserResponse(data.user)

      login(user, data.token)
    },
    onError: (error: any) => {
      console.error('Error en login:', error)
    }
  })
}

export const useLogin2FA = () => {
  const { login } = useAuth()

  return useMutation({
    mutationFn: login2FA,
    onSuccess: data => {
      const user = mapUserResponse(data.user)

      login(user, data.token)
    },
    onError: (error: any) => {
      console.error('Error en verificación 2FA:', error)
    }
  })
}
