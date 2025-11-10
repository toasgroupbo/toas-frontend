'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Role, CreateRoleDto, UpdateRoleDto } from '@/types/api/roles'

const fetchRoles = async (): Promise<Role[]> => {
  const response = await api.get<Role[]>('/api/roles')

  
return response.data
}

const createRole = async (data: CreateRoleDto): Promise<Role> => {
  const response = await api.post<Role>('/api/roles', data)

  
return response.data
}

const deleteRole = async (id: number): Promise<void> => {
  await api.delete(`/api/roles/${id}`)
}

const updateRole = async ({ id, data }: { id: number; data: UpdateRoleDto }): Promise<Role> => {
  const response = await api.patch<Role>(`/api/roles/${id}`, data)

  return response.data
}

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles
  })
}

export const useCreateRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    }
  })
}

export const useDeleteRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    }
  })
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
    }
  })
}
