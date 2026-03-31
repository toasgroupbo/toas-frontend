'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Settings, UpdateSettingsDto } from '@/types/api/settings'

const fetchSettings = async (): Promise<Settings> => {
  const response = await api.get<Settings>('/api/settings')

  return response.data
}

const updateSettings = async (data: UpdateSettingsDto): Promise<Settings> => {
  const response = await api.patch<Settings>('/api/settings', data)

  return response.data
}

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  })
}

export const useUpdateSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })
}
