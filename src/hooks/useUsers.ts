'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { User, CreateUserDto, UpdateUserDto } from '@/types/api/users'

const fetchUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/api/users')

  return response.data
}

const createUser = async (data: CreateUserDto): Promise<User> => {
  const response = await api.post<User>('/api/users/admins', data)

  return response.data
}

const updateUser = async ({ id, data }: { id: string; data: UpdateUserDto }): Promise<User> => {
  const response = await api.patch<User>(`/api/users/${id}`, data)

  return response.data
}

const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/api/users/${id}`)
}

const changePassword = async ({ id, password }: { id: string; password: string }): Promise<void> => {
  await api.put(`/api/users/${id}`, { password })
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  })
}

export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}

export const useChangePassword = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}
