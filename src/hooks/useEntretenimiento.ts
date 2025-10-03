import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'
import type {
  LugarEntretenimiento,
  RespuestaLugaresEntretenimiento,
  RespuestaSubcategoriasEntretenimiento,
  CrearLugarEntretenimiento,
  ActualizarLugarEntretenimiento,
  FiltrosEntretenimiento,
  SubcategoriaEntretenimiento
} from '@/types/api/entretenimiento'

interface LugarEntretenimientoResponse {
  statusCode: number
  message: string
  data: LugarEntretenimiento
}

export const useEntretenimiento = (
  page?: number,
  pageSize?: number,
  searchQuery?: string,
  subcategoriaId?: number | null,
  enabled: boolean = true
) => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const lugaresQuery = useQuery<RespuestaLugaresEntretenimiento>({
    queryKey: ['lugares-entretenimiento-paginated', page, pageSize, searchQuery, subcategoriaId],
    queryFn: async () => {
      const params: any = {
        limit: pageSize || 10,
        offset: ((page || 1) - 1) * (pageSize || 10),
        filter: searchQuery || ''
      }

      if (subcategoriaId) {
        params.sub_categoria_id = subcategoriaId
      }

      const response = await api.get<RespuestaLugaresEntretenimiento>('/api/admin/lugares-entretenimiento', {
        params
      })

      return response.data
    },
    enabled: isAuthenticated && enabled && page !== undefined,
    placeholderData: previousData => previousData
  })

  const useGetLugaresEntretenimiento = (params?: FiltrosEntretenimiento) => {
    return useQuery({
      queryKey: ['lugares-entretenimiento', params],
      queryFn: async () => {
        const response = await api.get<RespuestaLugaresEntretenimiento>('/api/admin/lugares-entretenimiento', {
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

  const useGetLugarEntretenimiento = (id?: number) => {
    return useQuery({
      queryKey: ['lugar-entretenimiento', id],
      queryFn: async () => {
        if (!id) return null
        const response = await api.get<LugarEntretenimientoResponse>(`/api/admin/lugares-entretenimiento/${id}`)

        return response.data?.data || response.data
      },
      enabled: isAuthenticated && !!id
    })
  }

  const useGetSubcategoriasEntretenimiento = () => {
    return useQuery<SubcategoriaEntretenimiento[]>({
      queryKey: ['subcategorias-entretenimiento'],
      queryFn: async () => {
        const response = await api.get<{
          statusCode: number
          message: string
          data: SubcategoriaEntretenimiento[]
        }>('/api/admin/subcategorias', {
          params: { categoria_id: 3 }
        })

        return response.data.data || []
      },
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000
    })
  }

  const useCreateEntretenimiento = () => {
    return useMutation({
      mutationFn: async (data: CrearLugarEntretenimiento): Promise<LugarEntretenimiento> => {
        const response = await api.post<LugarEntretenimientoResponse>('/api/admin/lugares-entretenimiento', data)

        return response.data?.data || response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lugares-entretenimiento'] })
        queryClient.invalidateQueries({ queryKey: ['subcategorias-entretenimiento'] })
      }
    })
  }

  const useUpdateEntretenimiento = () => {
    return useMutation({
      mutationFn: async (data: ActualizarLugarEntretenimiento): Promise<LugarEntretenimiento> => {
        const { id, ...updateData } = data

        const response = await api.patch<LugarEntretenimientoResponse>(
          `/api/admin/lugares-entretenimiento/${id}`,
          updateData
        )

        return response.data?.data || response.data
      },
      onSuccess: data => {
        queryClient.invalidateQueries({ queryKey: ['lugares-entretenimiento'] })
        queryClient.invalidateQueries({ queryKey: ['lugar-entretenimiento', data.id] })
        queryClient.invalidateQueries({ queryKey: ['lugares-entretenimiento-paginated'] })
      }
    })
  }

  const useDeleteEntretenimiento = () => {
    return useMutation({
      mutationFn: async (id: number): Promise<void> => {
        await api.delete(`/api/admin/lugares-entretenimiento/${id}`)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lugares-entretenimiento'] })
        queryClient.invalidateQueries({ queryKey: ['lugares-entretenimiento-paginated'] })
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

    useGetLugaresEntretenimiento,
    useGetLugarEntretenimiento,
    useGetSubcategoriasEntretenimiento,
    useCreateEntretenimiento,
    useUpdateEntretenimiento,
    useDeleteEntretenimiento,

    refetchLugaresEntretenimiento: () => {
      queryClient.invalidateQueries({ queryKey: ['lugares-entretenimiento'] })
      queryClient.invalidateQueries({ queryKey: ['lugares-entretenimiento-paginated'] })
    },
    refetchSubcategorias: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategorias-entretenimiento'] })
    }
  }
}
