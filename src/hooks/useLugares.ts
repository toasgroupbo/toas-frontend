'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Place, CreatePlaceDto, UpdatePlaceDto } from '@/types/api/lugares'

const fetchPlaces = async (): Promise<Place[]> => {
  const response = await api.get<Place[]>('/api/places')

  return response.data
}

const createPlace = async (data: CreatePlaceDto): Promise<Place> => {
  const response = await api.post<Place>('/api/places', data)

  return response.data
}

const updatePlace = async ({ id, data }: { id: number; data: UpdatePlaceDto }): Promise<Place> => {
  const response = await api.patch<Place>(`/api/places/${id}`, data)

  return response.data
}

export const usePlaces = () => {
  return useQuery({
    queryKey: ['places'],
    queryFn: fetchPlaces
  })
}

export const useCreatePlace = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
    }
  })
}

export const useUpdatePlace = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updatePlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] })
    }
  })
}
