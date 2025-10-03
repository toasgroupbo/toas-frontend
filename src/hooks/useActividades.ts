import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'

import type { Actividad, CreateActividadRequest, ActividadesResponse, ActividadResponse } from '@/types/api/actividades'

export const useActividades = (
  page: number = 1,
  pageSize: number = 10,
  searchQuery: string = '',
  eventoId: number | null = null,
  enabled: boolean = true
) => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const actividadesQuery = useQuery<ActividadesResponse>({
    queryKey: ['actividades', page, pageSize, searchQuery, eventoId],

    queryFn: async () => {
      const params: any = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
        filter: searchQuery
      }

      /*  console.log('Response completa:', response.data)
      console.log('Items:', response.data?.data?.items)
      console.log('Página actual:', response.data?.data?.currentPage)
      console.log('Total páginas:', response.data?.data?.totalPages) */
      if (eventoId) {
        params.evento_id = eventoId
      }

      const response = await api.get<ActividadesResponse>('api/admin/actividades', {
        params
      })

      return response.data
    },
    enabled: isAuthenticated && enabled,
    placeholderData: previousData => previousData
  })

  // Mutación para crear actividad
  const createActividadMutation = useMutation<ActividadResponse, Error, CreateActividadRequest>({
    mutationFn: async (data: CreateActividadRequest) => {
      const response = await api.post<ActividadResponse>('api/admin/actividades', data)

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividades'] })
    }
  })

  // Mutación para actualizar actividad
  const updateActividadMutation = useMutation<
    ActividadResponse,
    Error,
    { id: number; data: Partial<CreateActividadRequest> }
  >({
    mutationFn: async ({ id, data }) => {
      const response = await api.patch<ActividadResponse>(`api/admin/actividades/${id}`, data)

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividades'] })
    }
  })

  // Mutación para eliminar actividad
  const deleteActividadMutation = useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      await api.delete(`api/admin/actividades/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividades'] })
    }
  })

  // Función para buscar actividad por ID
  const getActividadById = async (id: number): Promise<Actividad | null> => {
    try {
      const response = await api.get<ActividadResponse>(`api/admin/actividades/${id}`)

      return response.data?.data || response.data
    } catch (error) {
      console.error('Error al buscar actividad:', error)

      return null
    }
  }

  // Función para obtener actividades por evento
  const getActividadesByEvento = async (eventoId: number): Promise<Actividad[]> => {
    try {
      const response = await api.get<ActividadesResponse>('api/admin/actividades')
      const todasActividades: Actividad[] = response.data?.data?.items || []

      return todasActividades.filter(actividad => actividad.evento_id === eventoId)
    } catch (error) {
      console.error('Error al buscar actividades por evento:', error)

      return []
    }
  }

  return {
    actividades: actividadesQuery.data?.data?.items || [],
    total: actividadesQuery.data?.data?.totalItems || 0,
    currentPage: actividadesQuery.data?.data?.currentPage || 1,
    totalPages: actividadesQuery.data?.data?.totalPages || 1,
    pageSize: actividadesQuery.data?.data?.pageSize || pageSize,

    // Loading states
    isLoading: actividadesQuery.isLoading,
    isFetching: actividadesQuery.isFetching,
    isCreating: createActividadMutation.isPending,
    isUpdating: updateActividadMutation.isPending,
    isDeleting: deleteActividadMutation.isPending,

    // Error states
    error: actividadesQuery.error,
    createError: createActividadMutation.error,
    updateError: updateActividadMutation.error,
    deleteError: deleteActividadMutation.error,

    // Actions
    crearActividad: createActividadMutation.mutateAsync,
    actualizarActividad: updateActividadMutation.mutateAsync,
    eliminarActividad: deleteActividadMutation.mutateAsync,
    getActividadById,
    getActividadesByEvento,

    // Utils
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['actividades'] })
    },
    isAuthenticated
  }
}

// ============ HOOK ESPECÍFICO PARA UNA ACTIVIDAD ============
export const useActividad = (id?: number) => {
  const { isAuthenticated } = useAuth()

  return useQuery<Actividad>({
    queryKey: ['actividad', id],
    queryFn: async () => {
      const response = await api.get<ActividadResponse>(`api/admin/actividades/${id}`)

      return response.data?.data || response.data
    },
    enabled: !!id && isAuthenticated
  })
}

// ============ HOOK PARA ACTIVIDADES POR EVENTO ============
export const useActividadesByEvento = (eventoId?: number) => {
  const { isAuthenticated } = useAuth()

  return useQuery<Actividad[]>({
    queryKey: ['actividades-evento', eventoId],
    queryFn: async () => {
      const response = await api.get<ActividadesResponse>('api/admin/actividades')
      const todasActividades: Actividad[] = response.data?.data?.items || []

      return todasActividades.filter(actividad => actividad.evento_id === eventoId)
    },
    enabled: !!eventoId && isAuthenticated
  })
}

// ============ HOOK PÚBLICO  ============
export const useActividadesPublic = (enabled: boolean = true) => {
  const queryClient = useQueryClient()

  const actividadesPublicQuery = useQuery<ActividadesResponse>({
    queryKey: ['actividades-public'],
    queryFn: async () => {
      const response = await api.post<ActividadesResponse>('api/actividades')

      return response.data
    },
    enabled
  })

  return {
    actividades: actividadesPublicQuery.data?.data?.items || [],
    total: actividadesPublicQuery.data?.data?.totalItems || 0,
    isLoading: actividadesPublicQuery.isLoading,
    error: actividadesPublicQuery.error,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['actividades-public'] })
  }
}
