import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import { useAuth } from '@/contexts/AuthContext'
import type { Lugar, CreateLugarRequest, UpdateLugarRequest, LugaresResponse, LugarResponse } from '@/types/api/lugares'

export const useLugares = (page?: number, pageSize?: number, searchQuery?: string, enabled: boolean = true) => {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const lugaresQuery = useQuery<LugaresResponse>({
    queryKey: ['lugares-paginated', page, pageSize, searchQuery],
    queryFn: async () => {
      const params: any = {
        limit: pageSize || 10,
        offset: ((page || 1) - 1) * (pageSize || 10),
        filter: searchQuery || ''
      }

      const response = await api.get<LugaresResponse>('/api/admin/lugares', {
        params
      })

      return response.data
    },
    enabled: isAuthenticated && enabled && page !== undefined,
    placeholderData: previousData => previousData
  })

  const useGetLugares = (params?: { limit?: number; offset?: number; filter?: string }) => {
    return useQuery({
      queryKey: ['lugares', params],
      queryFn: async () => {
        const response = await api.get<LugaresResponse>('/api/admin/lugares', {
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

  const useGetLugar = (id?: number) => {
    return useQuery({
      queryKey: ['lugar', id],
      queryFn: async () => {
        if (!id) return null
        const response = await api.get<LugarResponse>(`/api/admin/lugares/${id}`)

        return response.data?.data || response.data
      },
      enabled: isAuthenticated && !!id
    })
  }

  const useCreateLugar = () => {
    return useMutation({
      mutationFn: async (data: CreateLugarRequest): Promise<Lugar> => {
        const response = await api.post<LugarResponse>('/api/admin/lugares', data)

        return response.data?.data || response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lugares'] })
        queryClient.invalidateQueries({ queryKey: ['lugares-buscar'] })
      }
    })
  }

  const useUpdateLugar = () => {
    return useMutation({
      mutationFn: async (data: UpdateLugarRequest): Promise<Lugar> => {
        const { id, ...updateData } = data
        const response = await api.patch<LugarResponse>(`/api/admin/lugares/${id}`, updateData)

        return response.data?.data || response.data
      },
      onSuccess: data => {
        queryClient.invalidateQueries({ queryKey: ['lugares'] })
        queryClient.invalidateQueries({ queryKey: ['lugar', data.id] })
        queryClient.invalidateQueries({ queryKey: ['lugares-buscar'] })
      }
    })
  }

  const useDeleteLugar = () => {
    return useMutation({
      mutationFn: async (id: number): Promise<void> => {
        await api.delete(`/api/admin/lugares/${id}`)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lugares-paginated'] })
        queryClient.invalidateQueries({ queryKey: ['lugar'] })
      }
    })
  }

  return {
    // Queries
    lugares: lugaresQuery.data?.data?.items || [],
    total: lugaresQuery.data?.data?.totalItems || 0,
    currentPage: lugaresQuery.data?.data?.currentPage || 1,
    totalPages: lugaresQuery.data?.data?.totalPages || 1,
    pageSize: lugaresQuery.data?.data?.pageSize || pageSize || 10,
    isLoading: lugaresQuery.isLoading,
    isFetching: lugaresQuery.isFetching,
    error: lugaresQuery.error,

    useGetLugares,
    useGetLugar,
    useCreateLugar,
    useUpdateLugar,
    useDeleteLugar,

    refetchLugares: () => {
      queryClient.invalidateQueries({ queryKey: ['lugares'] })
      queryClient.invalidateQueries({ queryKey: ['lugares-paginated'] })
      queryClient.invalidateQueries({ queryKey: ['lugares-buscar'] })
    }
  }
}
