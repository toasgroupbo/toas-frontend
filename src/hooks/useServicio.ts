import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'
import type {
  LugarServicio,
  RespuestaLugaresServicio,
  RespuestaSubcategoriasServicio,
  CrearLugarServicio,
  ActualizarLugarServicio,
  FiltrosServicio,
  SubcategoriaServicio
} from '@/types/api/servicio'

// Tipo para respuesta individual
interface LugarServicioResponse {
  statusCode: number
  message: string
  data: LugarServicio
}

export const useServicio = (
  page?: number,
  pageSize?: number,
  searchQuery?: string,
  subcategoriaId?: number | null,
  enabled: boolean = true
) => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const lugaresQuery = useQuery<RespuestaLugaresServicio>({
    queryKey: ['lugares-servicio-paginated', page, pageSize, searchQuery, subcategoriaId],
    queryFn: async () => {
      const params: any = {
        limit: pageSize || 10,
        offset: ((page || 1) - 1) * (pageSize || 10),
        filter: searchQuery || ''
      }

      if (subcategoriaId) {
        params.sub_categoria_id = subcategoriaId
      }

      const response = await api.get<RespuestaLugaresServicio>('/api/admin/lugares-servicio', {
        params
      })

      return response.data
    },
    enabled: isAuthenticated && enabled && page !== undefined,
    placeholderData: previousData => previousData
  })

  const useGetLugaresServicio = (params?: FiltrosServicio) => {
    return useQuery({
      queryKey: ['lugares-servicio', params],
      queryFn: async () => {
        const response = await api.get<RespuestaLugaresServicio>('/api/admin/lugares-servicio', {
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

  const useGetLugarServicio = (id?: number) => {
    return useQuery({
      queryKey: ['lugar-servicio', id],
      queryFn: async () => {
        if (!id) return null
        const response = await api.get<LugarServicioResponse>(`/api/admin/lugares-servicio/${id}`)

        return response.data?.data || response.data
      },
      enabled: isAuthenticated && !!id
    })
  }

  const useGetSubcategoriasServicio = () => {
    return useQuery<SubcategoriaServicio[]>({
      queryKey: ['subcategorias-servicio'],
      queryFn: async () => {
        const response = await api.get<{
          statusCode: number
          message: string
          data: SubcategoriaServicio[]
        }>('/api/admin/subcategorias', {
          params: { categoria_id: 5 }
        })

        return response.data.data || []
      },
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000
    })
  }

  const useCreateServicio = () => {
    return useMutation({
      mutationFn: async (data: CrearLugarServicio): Promise<LugarServicio> => {
        const response = await api.post<LugarServicioResponse>('/api/admin/lugares-servicio', data)

        return response.data?.data || response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lugares-servicio'] })
        queryClient.invalidateQueries({ queryKey: ['lugares-servicio-paginated'] })
        queryClient.invalidateQueries({ queryKey: ['subcategorias-servicio'] })
      }
    })
  }

  const useUpdateServicio = () => {
    return useMutation({
      mutationFn: async (data: ActualizarLugarServicio): Promise<LugarServicio> => {
        const { id, ...updateData } = data
        const response = await api.patch<LugarServicioResponse>(`/api/admin/lugares-servicio/${id}`, updateData)

        return response.data?.data || response.data
      },
      onSuccess: data => {
        queryClient.invalidateQueries({ queryKey: ['lugares-servicio'] })
        queryClient.invalidateQueries({ queryKey: ['lugar-servicio', data.id] })
        queryClient.invalidateQueries({ queryKey: ['lugares-servicio-paginated'] })
      }
    })
  }

  const useDeleteServicio = () => {
    return useMutation({
      mutationFn: async (id: number): Promise<void> => {
        await api.delete(`/api/admin/lugares-servicio/${id}`)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lugares-servicio'] })
        queryClient.invalidateQueries({ queryKey: ['lugares-servicio-paginated'] })
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

    // Queries
    useGetLugaresServicio,
    useGetLugarServicio,
    useGetSubcategoriasServicio,

    // Mutations
    useCreateServicio,
    useUpdateServicio,
    useDeleteServicio,

    // Utils
    refetchLugaresServicio: () => {
      queryClient.invalidateQueries({ queryKey: ['lugares-servicio'] })
      queryClient.invalidateQueries({ queryKey: ['lugares-servicio-paginated'] })
    },
    refetchSubcategorias: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategorias-servicio'] })
    }
  }
}
