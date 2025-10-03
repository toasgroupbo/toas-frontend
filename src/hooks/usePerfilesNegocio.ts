'use client'

import { useQuery } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'

interface Lugar {
  id: number
  nombre_es: string
}

interface PerfilNegocio {
  id: number
  nombre_publicador: string
  lugar: Lugar
}

interface PerfilesNegocioResponse {
  data: PerfilNegocio[]
  message: string
  statusCode: number
  error: boolean
}

const fetchPerfilesNegocio = async (): Promise<PerfilesNegocioResponse> => {
  const response = await api.get<PerfilesNegocioResponse>('/api/auth/perfiles-negocio')

  if (response.data.statusCode !== 200 || response.data.error) {
    throw new Error(response.data.message || 'Error al obtener perfiles de negocio')
  }

  return response.data
}

export const usePerfilesNegocio = (enabled: boolean = true) => {
  const { user, isAuthenticated } = useAuth()

  return useQuery({
    queryKey: ['perfiles-negocio', user?.id],
    queryFn: fetchPerfilesNegocio,
    enabled: isAuthenticated && !!user && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2
  })
}

export const usePerfilNegocioActual = (enabled: boolean = true) => {
  const { user } = useAuth()
  const { data: perfilesData, ...rest } = usePerfilesNegocio(enabled)

  const perfilActual = perfilesData?.data?.find(perfil => perfil.id === user?.perfil_negocio_id)

  return {
    ...rest,
    data: perfilActual,
    perfilCompleto: perfilActual
  }
}
