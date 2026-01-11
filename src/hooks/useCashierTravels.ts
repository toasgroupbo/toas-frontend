'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Travel } from '@/types/api/travels'
import { useAuth } from '@/contexts/AuthContext'

const fetchCashierTravels = async (): Promise<Travel[]> => {
  const response = await api.get<Travel[]>('/api/travels/for-cashier/all')

  return response.data
}

const fetchCashierTravelById = async (id: number): Promise<Travel> => {
  const response = await api.get<Travel>(`/api/travels/for-cashier/${id}`)

  return response.data
}

export const useCashierTravels = () => {
  const { isCashier } = useAuth()

  return useQuery({
    queryKey: ['cashier-travels'],
    queryFn: fetchCashierTravels,
    enabled: isCashier
  })
}

export const useCashierTravelById = (id: number | null) => {
  const { isCashier } = useAuth()

  return useQuery({
    queryKey: ['cashier-travel', id],
    queryFn: () => fetchCashierTravelById(id!),
    enabled: isCashier && id !== null
  })
}

const closeTravel = async (id: number): Promise<void> => {
  await api.post(`/api/travels/for-cashier/closed/${id}`)
}

export const useCloseTravel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: closeTravel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashier-travels'] })
    }
  })
}
