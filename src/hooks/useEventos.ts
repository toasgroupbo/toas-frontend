import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'
import type {
  Evento,
  CreateEventoRequest,
  UpdateEventoRequest,
  EventosResponse,
  EventoResponse
} from '@/types/api/evento'

// ============ HOOK PRINCIPAL DE EVENTOS ============
export const useEventos = (enabled: boolean = true) => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  // Query para obtener eventos (admin)
  const eventosQuery = useQuery<EventosResponse>({
    queryKey: ['eventos'],
    queryFn: async () => {
      const response = await api.get<EventosResponse>('api/admin/eventos')

      /*  console.log('data', response.data)
      console.log(response.config.headers) */

      return response.data
    },
    enabled: isAuthenticated && enabled
  })

  // Mutación para crear evento
  const createEventoMutation = useMutation<EventoResponse, Error, CreateEventoRequest>({
    mutationFn: async (data: CreateEventoRequest) => {
      const response = await api.post<EventoResponse>('api/admin/eventos', data)

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
    }
  })

  // Mutación para actualizar evento
  const updateEventoMutation = useMutation<EventoResponse, Error, UpdateEventoRequest>({
    mutationFn: async (updateData: UpdateEventoRequest) => {
      const { id, ...data } = updateData
      const response = await api.patch<EventoResponse>(`api/admin/eventos/${id}`, data)

      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
    }
  })

  // Mutación para eliminar evento
  const deleteEventoMutation = useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      await api.delete(`api/admin/eventos/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
    }
  })

  // ============ FUNCIÓN ESPECIAL  ============
  // Verificar si existe evento para una fecha y crearlo si no existe
  const verificarOCrearEvento = async (fecha: string, nombre?: string): Promise<Evento> => {
    try {
      const eventosResponse = await api.get<EventosResponse>('api/admin/eventos')
      const eventos: Evento[] = eventosResponse.data?.data || []

      const eventoExistente = eventos.find(evento => evento.fecha?.split('T')[0] === fecha)

      if (eventoExistente) {
        return eventoExistente
      }

      const nuevoEvento: CreateEventoRequest = {
        nombre_es: nombre || `Evento ${fecha}`,
        fecha: `${fecha}T00:00:00.000Z`,
        descripcion_es: `Evento del día ${fecha}`,
        relevancia: 0
      }

      const response = await api.post<EventoResponse>('api/admin/eventos', nuevoEvento)

      queryClient.invalidateQueries({ queryKey: ['eventos'] })

      return response.data?.data || response.data
    } catch (error) {
      console.error('Error verificando/creando evento:', error)
      throw error
    }
  }

  // Función para buscar evento por ID - MEJORADA
  const getEventoById = async (id: number): Promise<Evento | null> => {
    try {
      const response = await api.get<EventoResponse>(`api/admin/eventos/${id}`)

      return response.data?.data || response.data
    } catch (error) {
      console.error('Error al buscar evento:', error)

      return null
    }
  }

  // ============ COMPUTED VALUES - MEJORADOS ============
  const eventos = eventosQuery.data?.data || []
  const total = eventosQuery.data?.total
  const isLoading = eventosQuery.isLoading
  const error = eventosQuery.error

  return {
    // Data - MÁS EXPLÍCITO
    eventos,
    total,

    // Loading states
    isLoading,
    isCreating: createEventoMutation.isPending,
    isUpdating: updateEventoMutation.isPending,
    isDeleting: deleteEventoMutation.isPending,

    // Error states
    error,
    createError: createEventoMutation.error,
    updateError: updateEventoMutation.error,
    deleteError: deleteEventoMutation.error,

    // Actions - TIPADO MEJORADO
    crearEvento: createEventoMutation.mutateAsync,
    actualizarEvento: updateEventoMutation.mutateAsync,
    eliminarEvento: deleteEventoMutation.mutateAsync,
    getEventoById,

    verificarOCrearEvento,

    // Utils
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
    },
    isAuthenticated
  }
}

// ============ HOOK ESPECÍFICO PARA UN EVENTO - MEJORADO ============
export const useEvento = (id?: number) => {
  const { isAuthenticated } = useAuth()

  return useQuery<Evento>({
    queryKey: ['evento', id],
    queryFn: async () => {
      const response = await api.get<EventoResponse>(`api/admin/eventos/${id}`)

      return response.data?.data || response.data
    },
    enabled: !!id && isAuthenticated
  })
}

// ============ HOOK PÚBLICO - CONFIRMADO POST ============
export const useEventosPublic = (enabled: boolean = true) => {
  const queryClient = useQueryClient()

  const eventosPublicQuery = useQuery<EventosResponse>({
    queryKey: ['eventos-public'],
    queryFn: async () => {
      const response = await api.post<EventosResponse>('api/eventos')

      return response.data
    },
    enabled
  })

  return {
    eventos: eventosPublicQuery.data?.data || [],
    total: eventosPublicQuery.data?.total,
    isLoading: eventosPublicQuery.isLoading,
    error: eventosPublicQuery.error,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['eventos-public'] })
  }
}
