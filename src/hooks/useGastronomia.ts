import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'
import type {
  LugarGastronomia,
  RespuestaLugaresGastronomia,
  RespuestaSubcategoriasGastronomia,
  ActualizarLugarGastronomico,
  CrearLugarGastronomico,
  FiltrosGastronomia,
  SubcategoriaGastronomia
} from '@/types/api/gastronomia'

interface LugarGastronomiaResponse {
  statusCode: number
  message: string
  data: LugarGastronomia
}

export const useGastronomia = (
  page?: number,
  pageSize?: number,
  searchQuery?: string,
  subcategoriaId?: number | null,
  enabled: boolean = true
) => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const lugaresQuery = useQuery<RespuestaLugaresGastronomia>({
    queryKey: ['lugares-gastronomia-paginated', page, pageSize, searchQuery, subcategoriaId],
    queryFn: async () => {
      const params: any = {
        limit: pageSize || 10,
        offset: ((page || 1) - 1) * (pageSize || 10),
        filter: searchQuery || ''
      }

      if (subcategoriaId) {
        params.sub_categoria_id = subcategoriaId
      }

      const response = await api.get<RespuestaLugaresGastronomia>('/api/admin/lugares-gastronomia', {
        params
      })

      return response.data
    },
    enabled: isAuthenticated && enabled && page !== undefined,
    placeholderData: previousData => previousData
  })

  const useGetLugaresGastronomia = (params?: FiltrosGastronomia) => {
    return useQuery({
      queryKey: ['lugares-gastronomia', params],
      queryFn: async () => {
        const response = await api.get<RespuestaLugaresGastronomia>('/api/admin/lugares-gastronomia', {
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

  const useGetLugarGastronomia = (id?: number) => {
    return useQuery({
      queryKey: ['lugar-gastronomia', id],
      queryFn: async () => {
        if (!id) return null
        const response = await api.get<LugarGastronomiaResponse>(`/api/admin/lugares-gastronomia/${id}`)

        return response.data?.data || response.data
      },
      enabled: isAuthenticated && !!id
    })
  }

  const useGetSubcategoriasGastronomia = () => {
    return useQuery<SubcategoriaGastronomia[]>({
      queryKey: ['subcategorias-gastronomia'],
      queryFn: async () => {
        const response = await api.get<{
          statusCode: number
          message: string
          data: SubcategoriaGastronomia[]
        }>('/api/admin/subcategorias', {
          params: { categoria_id: 1 }
        })

        return response.data.data || []
      },
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000
    })
  }

  const useCreateGastronomia = () => {
    return useMutation({
      mutationFn: async (data: CrearLugarGastronomico): Promise<LugarGastronomia> => {
        const response = await api.post<LugarGastronomiaResponse>('/api/admin/lugares-gastronomia', data)

        return response.data?.data || response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lugares-gastronomia'] })
        queryClient.invalidateQueries({ queryKey: ['subcategorias-gastronomia'] })
      }
    })
  }

  const useUpdateGastronomia = () => {
    return useMutation({
      mutationFn: async (data: ActualizarLugarGastronomico): Promise<LugarGastronomia> => {
        const { id, ...updateData } = data
        const response = await api.patch<LugarGastronomiaResponse>(`/api/admin/lugares-gastronomia/${id}`, updateData)

        return response.data?.data || response.data
      },
      onSuccess: data => {
        queryClient.invalidateQueries({ queryKey: ['lugares-gastronomia-paginated'] })
        queryClient.invalidateQueries({ queryKey: ['lugares-gastronomia'] })
        queryClient.invalidateQueries({ queryKey: ['lugar-gastronomia', data.id] })
      }
    })
  }

  const useDeleteGastronomia = () => {
    return useMutation({
      mutationFn: async (id: number): Promise<void> => {
        await api.delete(`/api/admin/lugares-gastronomia/${id}`)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lugares-gastronomia'] })
        queryClient.invalidateQueries({ queryKey: ['lugares-gastronomia-paginated'] })
      }
    })
  }

  // CAMBIAR EL RETURN COMPLETO POR:
  return {
    lugares: lugaresQuery.data?.data?.items || [],
    total: lugaresQuery.data?.data?.totalItems || 0,
    currentPage: lugaresQuery.data?.data?.currentPage || 1,
    totalPages: lugaresQuery.data?.data?.totalPages || 1,
    pageSize: lugaresQuery.data?.data?.pageSize || pageSize || 10,
    isLoading: lugaresQuery.isLoading,
    isFetching: lugaresQuery.isFetching,
    error: lugaresQuery.error,

    useGetLugaresGastronomia,
    useGetLugarGastronomia,
    useGetSubcategoriasGastronomia,
    useCreateGastronomia,
    useUpdateGastronomia,
    useDeleteGastronomia,

    refetchLugaresGastronomia: () => {
      queryClient.invalidateQueries({ queryKey: ['lugares-gastronomia'] })
      queryClient.invalidateQueries({ queryKey: ['lugares-gastronomia-paginated'] })
    },
    refetchSubcategorias: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategorias-gastronomia'] })
    }
  }
}
