import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'
import type {
  LugarHospedaje,
  CrearActualizarHospedaje,
  CrearLugarHospedaje,
  RespuestaLugaresHospedaje,
  RespuestaSubcategoriasHospedaje,
  FiltrosHospedaje,
  SubcategoriaHospedaje
} from '@/types/api/hospedaje'

interface UpdateHospedajeRequest extends CrearActualizarHospedaje {
  id: number
}

interface LugarHospedajeResponse {
  statusCode: number
  message: string
  data: LugarHospedaje
}

export const useHospedaje = (
  page?: number,
  pageSize?: number,
  searchQuery?: string,
  subcategoriaId?: number | null,
  enabled: boolean = true
) => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const lugaresQuery = useQuery<RespuestaLugaresHospedaje>({
    queryKey: ['lugares-hospedaje-paginated', page, pageSize, searchQuery, subcategoriaId],
    queryFn: async () => {
      const params: any = {
        limit: pageSize || 10,
        offset: ((page || 1) - 1) * (pageSize || 10),
        filter: searchQuery || ''
      }

      if (subcategoriaId) {
        params.sub_categoria_id = subcategoriaId
      }

      const response = await api.get<RespuestaLugaresHospedaje>('/api/admin/lugares-hospedaje', {
        params
      })

      return response.data
    },
    enabled: isAuthenticated && enabled && page !== undefined,
    placeholderData: previousData => previousData
  })

  const useGetLugaresHospedaje = (params?: FiltrosHospedaje) => {
    return useQuery({
      queryKey: ['lugares-hospedaje', params],
      queryFn: async () => {
        const response = await api.get<RespuestaLugaresHospedaje>('/api/admin/lugares-hospedaje', {
          params: {
            limit: 1000,
            offset: 0,
            filter: '',
            ...params
          }
        })

        return response.data?.data
      },
      enabled: isAuthenticated
    })
  }

  const useGetLugarHospedaje = (id?: number) => {
    return useQuery({
      queryKey: ['lugar-hospedaje', id],
      queryFn: async () => {
        if (!id) return null
        const response = await api.get<LugarHospedajeResponse>(`/api/admin/lugares-hospedaje/${id}`)

        return response.data?.data || response.data
      },
      enabled: isAuthenticated && !!id
    })
  }

  const useGetSubcategoriasHospedaje = () => {
    return useQuery<SubcategoriaHospedaje[]>({
      queryKey: ['subcategorias-hospedaje'],
      queryFn: async () => {
        const response = await api.get<{
          statusCode: number
          message: string
          data: SubcategoriaHospedaje[]
        }>('/api/admin/subcategorias', {
          params: { categoria_id: 2 }
        })

        return response.data.data || []
      },
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000
    })
  }

  const useCreateHospedaje = () => {
    return useMutation({
      mutationFn: async (data: CrearLugarHospedaje): Promise<LugarHospedaje> => {
        const response = await api.post<LugarHospedajeResponse>('/api/admin/lugares-hospedaje', data)

        return response.data?.data || response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lugares-hospedaje'] })
        queryClient.invalidateQueries({ queryKey: ['subcategorias-hospedaje'] })
      }
    })
  }

  const useUpdateHospedaje = () => {
    return useMutation({
      mutationFn: async (data: UpdateHospedajeRequest): Promise<LugarHospedaje> => {
        const { id, ...updateData } = data
        const response = await api.patch<LugarHospedajeResponse>(`/api/admin/lugares-hospedaje/${id}`, updateData)

        return response.data?.data || response.data
      },
      onSuccess: data => {
        queryClient.invalidateQueries({ queryKey: ['lugares-hospedaje'] })
        queryClient.invalidateQueries({ queryKey: ['lugar-hospedaje', data.id] })
        queryClient.invalidateQueries({ queryKey: ['lugares-hospedaje-paginated'] })
      }
    })
  }

  const useDeleteHospedaje = () => {
    return useMutation({
      mutationFn: async (id: number): Promise<void> => {
        await api.delete(`/api/admin/lugares-hospedaje/${id}`)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lugares-hospedaje'] })
        queryClient.invalidateQueries({ queryKey: ['lugares-hospedaje-paginated'] })
      }
    })
  }

  return {
    lugares: lugaresQuery.data?.data?.items || [],
    total: lugaresQuery.data?.data?.totalItems || 0,
    currentPage: lugaresQuery.data?.data?.currentPage || 1,
    totalPages: lugaresQuery.data?.data?.totalPages || 1,
    pageSize: lugaresQuery.data?.data?.pageSize || pageSize || 10,
    isLoading: lugaresQuery.isLoading,
    isFetching: lugaresQuery.isFetching,
    error: lugaresQuery.error,

    useGetLugaresHospedaje,
    useGetLugarHospedaje,
    useGetSubcategoriasHospedaje,
    useCreateHospedaje,
    useUpdateHospedaje,
    useDeleteHospedaje,

    refetchLugaresHospedaje: () => {
      queryClient.invalidateQueries({ queryKey: ['lugares-hospedaje'] })
      queryClient.invalidateQueries({ queryKey: ['lugares-hospedaje-paginated'] })
    },
    refetchSubcategorias: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategorias-hospedaje'] })
    }
  }
}
