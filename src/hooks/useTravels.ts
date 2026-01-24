'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '@/libs/axios'
import type { Travel, CreateTravelDto } from '@/types/api/travels'
import { useAuth } from '@/contexts/AuthContext'

const fetchTravels = async (params: {
  page: number
  limit: number
  status?: string
}): Promise<{ data: Travel[]; meta: any }> => {
  const { page = 1, limit = 10, status } = params
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = '/api/travels'

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  })

  if (status && status !== 'all') {
    queryParams.append('status', status)
  }

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      queryParams.append('companyId', company.id.toString())
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  url = `${url}?${queryParams.toString()}`

  const response = await api.get<{ data: Travel[]; meta: any }>(url)

  return response.data
}

const fetchTravelById = async (id: string): Promise<Travel> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/travels/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/travels/${id}?companyId=${company.id}`
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

      url = `/api/travels?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  const response = await api.post<Travel>(url, data)

  return response.data
}

const deleteTravel = async (id: number): Promise<void> => {
  const actingAsCompany = localStorage.getItem('acting_as_company')
  let url = `/api/travels/${id}`

  if (actingAsCompany) {
    try {
      const company = JSON.parse(actingAsCompany)

      url = `/api/travels/${id}?companyId=${company.id}`
    } catch (error) {
      console.error('Error parsing acting_as_company:', error)
    }
  }

  await api.delete(url)
}

export const useTravels = (params: { page: number; limit: number; status?: string }) => {
  const { companyId } = useAuth()

  return useQuery({
    queryKey: ['travels', companyId, params.page, params.limit, params.status],
    queryFn: () => fetchTravels(params),
    enabled: !!companyId,
    placeholderData: previousData => previousData,
    staleTime: 5 * 60 * 1000,
    retry: 2
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
    },
    onError: error => {
      console.error('Error creating travel:', error)
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
