'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Travel, CreateTravelDto } from '@/types/api/travels'
import { useAuth } from '@/contexts/AuthContext'

const fetchTravels = async (): Promise<Travel[]> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = '/api/travels'

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/travels?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.get<Travel[]>(url)

  return response.data
}

const fetchTravelById = async (id: string): Promise<Travel> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/travels/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/travels/${id}?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.get<Travel>(url)

  return response.data
}

const createTravel = async (data: CreateTravelDto): Promise<Travel> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = '/api/travels'

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/travels?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.post<Travel>(url, data)

  return response.data
}

const deleteTravel = async (id: string): Promise<void> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/travels/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/travels/${id}?companyUUID=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  await api.delete(url)
}

export const useTravels = () => {
  const { companyUUID, hasCompany, isImpersonating } = useAuth()

  const shouldFetch = hasCompany || isImpersonating

  return useQuery({
    queryKey: ['travels', companyUUID],
    queryFn: fetchTravels,
    enabled: shouldFetch
  })
}

export const useTravelById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['travel', id],
    queryFn: () => fetchTravelById(id!),
    enabled: !!id
  })
}

export const useCreateTravel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTravel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travels'] })
    }
  })
}

export const useDeleteTravel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteTravel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['travels'] })
    }
  })
}
