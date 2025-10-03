import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'
import type {
  LugarTuristico,
  CrearLugarTuristico,
  ActualizarLugarTuristico,
  RespuestaLugaresTuristico,
  FiltrosTuristico,
  SubcategoriaTuristico
} from '@/types/api/turistico'

// Tipo para respuesta individual
interface LugarTuristicoResponse {
  statusCode: number
  message: string
  data: LugarTuristico
}

export const useTuristico = (
  page?: number,
  pageSize?: number,
  searchQuery?: string,
  subcategoriaId?: number | null,
  enabled: boolean = true
) => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const lugaresQuery = useQuery<RespuestaLugaresTuristico>({
    queryKey: ['lugares-turistico-paginated', page, pageSize, searchQuery, subcategoriaId],
    queryFn: async () => {
      const params: any = {
        limit: pageSize || 10,
        offset: ((page || 1) - 1) * (pageSize || 10),
        filter: searchQuery || ''
      }

      if (subcategoriaId) {
        params.sub_categoria_id = subcategoriaId
      }

      const response = await api.get<RespuestaLugaresTuristico>('/api/admin/lugares-turistico', {
        params
      })

      return response.data
    },
    enabled: isAuthenticated && enabled && page !== undefined,
    placeholderData: previousData => previousData
  })

  const useGetLugaresTuristico = (params?: FiltrosTuristico) => {
    return useQuery({
      queryKey: ['lugares-turistico', params],
      queryFn: async () => {
        const response = await api.get<RespuestaLugaresTuristico>('/api/admin/lugares-turistico', {
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

  const useGetLugarTuristico = (id?: number) => {
    return useQuery({
      queryKey: ['lugar-turistico', id],
      queryFn: async () => {
        if (!id) return null
        const response = await api.get<LugarTuristicoResponse>(`/api/admin/lugares-turistico/${id}`)

        return response.data?.data || response.data
      },
      enabled: isAuthenticated && !!id
    })
  }

  const useGetSubcategoriasTuristico = () => {
    return useQuery<SubcategoriaTuristico[]>({
      queryKey: ['subcategorias-turistico'],
      queryFn: async () => {
        const response = await api.get<{
          statusCode: number
          message: string
          data: SubcategoriaTuristico[]
        }>('/api/admin/subcategorias', {
          params: { categoria_id: 4 }
        })

        return response.data.data || []
      },
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000
    })
  }

  const useCreateTuristico = () => {
    return useMutation({
      mutationFn: async (data: CrearLugarTuristico): Promise<LugarTuristico> => {
        const response = await api.post<LugarTuristicoResponse>('/api/admin/lugares-turistico', data)

        return response.data?.data || response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lugares-turistico'] })
        queryClient.invalidateQueries({ queryKey: ['subcategorias-turistico'] })
      }
    })
  }

  const useUpdateTuristico = () => {
    return useMutation({
      mutationFn: async (data: ActualizarLugarTuristico): Promise<LugarTuristico> => {
        const { id, ...updateData } = data
        const response = await api.patch<LugarTuristicoResponse>(`/api/admin/lugares-turistico/${id}`, updateData)

        return response.data?.data || response.data
      },
      onSuccess: data => {
        queryClient.invalidateQueries({ queryKey: ['lugares-turistico'] })
        queryClient.invalidateQueries({ queryKey: ['lugares-turistico-paginated'] })
        queryClient.invalidateQueries({ queryKey: ['lugar-turistico', data.id] })
      }
    })
  }

  const useDeleteTuristico = () => {
    return useMutation({
      mutationFn: async (id: number): Promise<void> => {
        await api.delete(`/api/admin/lugares-turistico/${id}`)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lugares-turistico'] })
        queryClient.invalidateQueries({ queryKey: ['lugares-turistico-paginated'] })
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

    useGetLugaresTuristico,
    useGetLugarTuristico,
    useGetSubcategoriasTuristico,
    useCreateTuristico,
    useUpdateTuristico,
    useDeleteTuristico,

    refetchLugaresTuristico: () => {
      queryClient.invalidateQueries({ queryKey: ['lugares-turistico'] })
      queryClient.invalidateQueries({ queryKey: ['lugares-turistico-paginated'] })
    },
    refetchSubcategorias: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategorias-turistico'] })
    }
  }
}
