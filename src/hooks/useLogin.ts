'use client'

import { useMutation } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'
import type { LoginRequest, LoginResponse, User } from '@/types/api/auth'

const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/api/auth/login', credentials)

  
return response.data
}

export const useLogin = () => {
  const { login } = useAuth()

  return useMutation({
    mutationFn: loginUser,
    onSuccess: data => {
      const { token, user: userData } = data

      const user: User = {
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
        companyId: userData.company?.id || null
      }

      login(user, token)
    },
    onError: (error: any) => {
      console.error('Error en login:', error)
    }
  })
}
